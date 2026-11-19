import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import type { ReadableStream as NodeReadableStream } from 'node:stream/web';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { convertImageToWebp, detectAndValidate } from '@/lib/image.utils';
import { getRelativeUploadPath, resolveUploadPath, toPpdbUploadUrl } from '@/lib/upload-storage';
import { BERKAS_FIELDS, BerkasKey, UPLOAD_MAX_BYTES } from '@/lib/ppdb-upload.config';
import { getOrCreatePendaftaran } from '@/lib/ppdb-registration';

export type SavedFile = {
  url: string | null;
  staleUrl: string | null;
  newUrl: string | null;
};

export async function deleteFileSilently(fileUrl: string) {
  try {
    if (!fileUrl || typeof fileUrl !== 'string') return;
    const relativePath = getRelativeUploadPath(fileUrl);
    if (!relativePath) return;

    const absolutePath = resolveUploadPath(relativePath);
    await unlink(absolutePath);
  } catch (error) {
    console.warn(`[deleteFileSilently] Tidak dapat menghapus berkas lama di ${fileUrl}:`, error);
  }
}

export async function cleanupNewFile(savedFile: SavedFile | null | undefined) {
  if (savedFile?.newUrl) await deleteFileSilently(savedFile.newUrl);
}

export async function cleanupStaleFile(savedFile: SavedFile | null | undefined) {
  if (savedFile?.staleUrl) await deleteFileSilently(savedFile.staleUrl);
}

export async function saveUploadedFile(
  value: FormDataEntryValue | null,
  userId: string,
  fieldName: string,
  existingUrl: string | null | undefined,
): Promise<SavedFile> {
  if (typeof value === 'string' && value.trim() !== '') {
    const submittedUrl = value.trim();
    if (submittedUrl !== existingUrl) {
      const relativePath = getRelativeUploadPath(submittedUrl);
      const userUploadPrefix = `${path.join('ppdb', userId)}${path.sep}`;
      if (!relativePath || !relativePath.startsWith(userUploadPrefix)) {
        throw new Error('Path berkas tidak valid');
      }
      resolveUploadPath(relativePath);
    }
    return { url: submittedUrl, staleUrl: null, newUrl: null };
  }

  if (!(value instanceof File) || value.size === 0) {
    return { url: existingUrl ?? null, staleUrl: null, newUrl: null };
  }

  if (value.size > UPLOAD_MAX_BYTES) {
    throw new Error(
      `${fieldName} melebihi batas ukuran ${Math.floor(UPLOAD_MAX_BYTES / (1024 * 1024))} MB`,
    );
  }

  const detectedMime = await detectAndValidate(value);
  const image = detectedMime.startsWith('image/');
  const isWebp = detectedMime === 'image/webp';
  const extension = image ? '.webp' : '.pdf';
  const fileName = `${fieldName}-${randomUUID()}${extension}`;
  const relativeDirectory = path.join('ppdb', userId);
  const absoluteDirectory = resolveUploadPath(relativeDirectory);

  await mkdir(absoluteDirectory, { recursive: true });
  const contents = image && !isWebp ? await convertImageToWebp(value) : null;
  const absolutePath = path.join(absoluteDirectory, fileName);

  try {
    if (contents) {
      await writeFile(absolutePath, contents, { flag: 'wx' });
    } else {
      await pipeline(
        Readable.fromWeb(value.stream() as unknown as NodeReadableStream),
        createWriteStream(absolutePath, { flags: 'wx' }),
      );
    }
  } catch (error) {
    await unlink(absolutePath).catch(() => undefined);
    throw error;
  }

  const newUrl = toPpdbUploadUrl(path.join(relativeDirectory, fileName));
  return {
    url: newUrl,
    staleUrl: existingUrl && existingUrl !== newUrl ? existingUrl : null,
    newUrl,
  };
}

function toBerkasUpdateData(key: BerkasKey, url: string): Prisma.BerkasPendaftaranUpdateInput {
  switch (key) {
    case 'kkUrl': return { kkUrl: url };
    case 'ktpOrangTuaUrl': return { ktpOrangTuaUrl: url };
    case 'kipUrl': return { kipUrl: url };
    case 'akteUrl': return { akteUrl: url };
    case 'ijazahUrl': return { ijazahUrl: url };
    case 'raporUrl': return { raporUrl: url };
    case 'prestasiUrl': return { prestasiUrl: url };
    case 'bpjsUrl': return { bpjsUrl: url };
    case 'sktmUrl': return { sktmUrl: url };
    case 'suratPernyataanCpdbUrl': return { suratPernyataanCpdbUrl: url };
    case 'suratTidakMerokokUrl': return { suratTidakMerokokUrl: url };
    case 'tampakDepanRumahUrl': return { tampakDepanRumahUrl: url };
    case 'tampakSampingRumahUrl': return { tampakSampingRumahUrl: url };
    case 'kamarTidurUrl': return { kamarTidurUrl: url };
    case 'kamarMandiUrl': return { kamarMandiUrl: url };
    case 'ruangTamuUrl': return { ruangTamuUrl: url };
  }
}

export async function saveSingleBerkas(params: {
  userId: string;
  key: BerkasKey;
  file: File;
}): Promise<{ key: BerkasKey; url: string }> {
  const { userId, key, file } = params;
  if (!Object.hasOwn(BERKAS_FIELDS, key)) throw new Error('Jenis berkas tidak valid');
  if (!(file instanceof File) || file.size === 0) throw new Error('Berkas wajib dipilih');

  const pendaftaran = await getOrCreatePendaftaran(userId);
  const existingBerkas = await prisma.berkasPendaftaran.findUnique({
    where: { pendaftaranId: pendaftaran.id },
  });
  const existingUrl = existingBerkas?.[key] ?? null;
  const savedFile = await saveUploadedFile(file, userId, BERKAS_FIELDS[key], existingUrl);

  if (!savedFile.url) throw new Error('Gagal menyimpan berkas');

  try {
    await prisma.berkasPendaftaran.upsert({
      where: { pendaftaranId: pendaftaran.id },
      update: toBerkasUpdateData(key, savedFile.url),
      create: {
        pendaftaranId: pendaftaran.id,
        ...toBerkasUpdateData(key, savedFile.url),
      } as Prisma.BerkasPendaftaranUncheckedCreateInput,
    });
  } catch (error) {
    await cleanupNewFile(savedFile);
    throw error;
  }

  await cleanupStaleFile(savedFile);
  return { key, url: savedFile.url };
}
