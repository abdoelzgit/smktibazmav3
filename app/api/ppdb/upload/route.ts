import { getPPDBUserFromToken } from '@/lib/ppdb-auth';
import { BERKAS_FIELDS, type BerkasKey, UPLOAD_MAX_BYTES } from '@/lib/ppdb-upload.config';
import { saveSingleBerkas } from '@/lib/ppdb-upload';

export const runtime = 'nodejs';

const MULTIPART_OVERHEAD_BYTES = 64 * 1024;

export async function POST(request: Request) {
  const user = await getPPDBUserFromToken();
  if (!user) {
    return Response.json({ success: false, error: 'Tidak terautentikasi' }, { status: 401 });
  }

  const contentLength = request.headers.get('content-length');
  if (contentLength !== null) {
    const bodySize = Number(contentLength);
    if (!Number.isSafeInteger(bodySize) || bodySize < 0) {
      return Response.json({ success: false, error: 'Ukuran request tidak valid' }, { status: 400 });
    }
    if (bodySize > UPLOAD_MAX_BYTES + MULTIPART_OVERHEAD_BYTES) {
      return Response.json({ success: false, error: 'Ukuran berkas melebihi batas 5 MB' }, { status: 413 });
    }
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ success: false, error: 'Format upload tidak valid' }, { status: 400 });
  }

  const rawKey = formData.get('key');
  const file = formData.get('file');
  if (typeof rawKey !== 'string' || !Object.hasOwn(BERKAS_FIELDS, rawKey)) {
    return Response.json({ success: false, error: 'Jenis berkas tidak valid' }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return Response.json({ success: false, error: 'Berkas wajib dipilih' }, { status: 400 });
  }
  if (file.size > UPLOAD_MAX_BYTES) {
    return Response.json({ success: false, error: 'Ukuran berkas melebihi batas 5 MB' }, { status: 413 });
  }

  try {
    const data = await saveSingleBerkas({
      userId: user.userId,
      key: rawKey as BerkasKey,
      file,
    });
    return Response.json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gagal menyimpan berkas';
    const status = message.includes('ukuran')
      ? 413
      : message.includes('Pendaftaran sudah difinalisasi')
        ? 409
        : message.includes('tidak valid') || message.includes('wajib')
          ? 400
          : 500;
    return Response.json({ success: false, error: status === 500 ? 'Gagal menyimpan berkas' : message }, { status });
  }
}
