'use server';

import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { mkdir, writeFile, unlink } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { KeadaanOrangTua, StatusKeluarga, StatusSekolah } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/app/actions/auth';
import { revalidatePath } from 'next/cache';
import { convertImageToWebp, isAllowedDocument, isImageFile } from '@/lib/image.utils';

const COOKIE_NAME = 'auth_session';
const LEGACY_COOKIE_NAME = 'admin_session';

export type FormResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

function asString(value: FormDataEntryValue | null | undefined): string {
  if (typeof value === 'string') return value;
  if (value instanceof File) return value.name;
  return '';
}

function asBoolean(value: FormDataEntryValue | null | undefined): boolean {
  const raw = asString(value).toLowerCase();
  return raw === 'true' || raw === '1' || raw === 'yes' || raw === 'on';
}

async function getUserFromToken(): Promise<{ userId: string; email: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (token) {
    const payload = await verifyToken(token);
    if (payload) {
      return { userId: payload.userId, email: payload.email };
    }
  }

  const legacyToken = cookieStore.get(LEGACY_COOKIE_NAME)?.value;
  const secret = process.env.JWT_SECRET;
  if (!legacyToken || !secret) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(legacyToken, new TextEncoder().encode(secret));
    const userId = typeof payload.userId === 'string' ? payload.userId : '';
    if (!userId) {
      return null;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'USER') {
      return null;
    }

    return { userId: user.id, email: user.email };
  } catch {
    return null;
  }
}

async function getOrCreatePendaftaran(userId: string) {
  let pendaftaran = await prisma.pendaftaran.findUnique({
    where: { userId },
  });

  if (!pendaftaran) {
    pendaftaran = await prisma.pendaftaran.create({
      data: {
        userId,
        status: 'DRAFT',
      },
    });
  }

  return pendaftaran;
}

export async function saveDataDiriAction(formData: FormData): Promise<FormResult> {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return { success: false, error: 'Tidak terautentikasi' };
    }

    const pendaftaran = await getOrCreatePendaftaran(user.userId);

    const namaLengkap = asString(formData.get('namaLengkap'));
    const email = asString(formData.get('email'));
    const existingBiodata = await prisma.biodataSiswa.findUnique({
      where: { pendaftaranId: pendaftaran.id },
      select: { fotoFormalUrl: true },
    });

    const fotoFormalUrl = await saveUploadedFile(
      formData.get('fotoFormalUrl'),
      user.userId,
      'foto-formal',
      existingBiodata?.fotoFormalUrl
    );
    const tempatLahir = asString(formData.get('tempatLahir'));
    const tanggalLahirStr = asString(formData.get('tanggalLahir'));
    const nik = asString(formData.get('nik'));
    const nisn = asString(formData.get('nisn'));
    const kewarganegaraan = asString(formData.get('kewarganegaraan')) || 'Indonesia';
    const anakKeStr = asString(formData.get('anakKe'));
    const jumlahSaudaraStr = asString(formData.get('jumlahSaudara'));
    const statusKeluarga = asString(formData.get('statusKeluarga')) || 'ANAK_KANDUNG';
    const tinggalBersama = asString(formData.get('tinggalBersama'));
    const alamatLengkap = asString(formData.get('alamatLengkap'));
    const noHpWhatsapp = asString(formData.get('noHpWhatsapp'));
    const mediaSosial = asString(formData.get('mediaSosial'));
    const bahasaAsing = asString(formData.get('bahasaAsing'));
    const riwayatPrestasi = asString(formData.get('riwayatPrestasi'));
    const riwayatOrganisasi = asString(formData.get('riwayatOrganisasi'));
    const beratBadanStr = asString(formData.get('beratBadan'));
    const tinggiBadanStr = asString(formData.get('tinggiBadan'));
    const riwayatPenyakit = asString(formData.get('riwayatPenyakit'));
    const isMerokok = asBoolean(formData.get('isMerokok'));
    const isButaWarna = asBoolean(formData.get('isButaWarna'));
    const hasPenyakitMenular = asBoolean(formData.get('hasPenyakitMenular'));
    const pernyataanSiswa = asBoolean(formData.get('pernyataanSiswa'));

    if (!namaLengkap) {
      return { success: false, error: 'Nama lengkap wajib diisi' };
    }

    const tanggalLahir = tanggalLahirStr ? new Date(tanggalLahirStr) : null;

    const biodata = await prisma.biodataSiswa.upsert({
      where: { pendaftaranId: pendaftaran.id },
      update: {
        namaLengkap,
        email,
        fotoFormalUrl,
        tempatLahir,
        tanggalLahir,
        nik,
        nisn,
        kewarganegaraan,
        anakKe: anakKeStr ? parseInt(anakKeStr, 10) : null,
        jumlahSaudara: jumlahSaudaraStr ? parseInt(jumlahSaudaraStr, 10) : null,
        statusKeluarga: statusKeluarga as StatusKeluarga,
        tinggalBersama,
        alamatLengkap,
        noHpWhatsapp,
        mediaSosial,
        bahasaAsing,
        riwayatPrestasi,
        riwayatOrganisasi,
        beratBadan: beratBadanStr ? parseFloat(beratBadanStr) : null,
        tinggiBadan: tinggiBadanStr ? parseFloat(tinggiBadanStr) : null,
        riwayatPenyakit,
        isMerokok,
        isButaWarna,
        hasPenyakitMenular,
        pernyataanSiswa,
      },
      create: {
        pendaftaranId: pendaftaran.id,
        namaLengkap,
        email,
        fotoFormalUrl,
        tempatLahir,
        tanggalLahir,
        nik,
        nisn,
        kewarganegaraan,
        anakKe: anakKeStr ? parseInt(anakKeStr, 10) : null,
        jumlahSaudara: jumlahSaudaraStr ? parseInt(jumlahSaudaraStr, 10) : null,
        statusKeluarga: statusKeluarga as StatusKeluarga,
        tinggalBersama,
        alamatLengkap,
        noHpWhatsapp,
        mediaSosial,
        bahasaAsing,
        riwayatPrestasi,
        riwayatOrganisasi,
        beratBadan: beratBadanStr ? parseFloat(beratBadanStr) : null,
        tinggiBadan: tinggiBadanStr ? parseFloat(tinggiBadanStr) : null,
        riwayatPenyakit,
        isMerokok,
        isButaWarna,
        hasPenyakitMenular,
        pernyataanSiswa,
      },
    });

    revalidatePath('/dashboard-ppdb/dashboard/pendaftaran');
    return { success: true, data: biodata };
  } catch (error) {
    console.error('saveDataDiriAction error:', error);
    return { success: false, error: 'Gagal menyimpan data diri' };
  }
}

export async function saveDataOrangTuaAction(formData: FormData): Promise<FormResult> {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return { success: false, error: 'Tidak terautentikasi' };
    }

    const pendaftaran = await getOrCreatePendaftaran(user.userId);

    const namaAyah = asString(formData.get('namaAyah'));
    const pekerjaanAyah = asString(formData.get('pekerjaanAyah'));
    const alamatDomisiliAyah = asString(formData.get('alamatDomisiliAyah'));
    const namaIbu = asString(formData.get('namaIbu'));
    const pekerjaanIbu = asString(formData.get('pekerjaanIbu'));
    const noHpOi = asString(formData.get('noHpOi'));
    const keadaanOrangTua = asString(formData.get('keadaanOrangTua')) || 'LENGKAP';
    const penghasilanOrangTua = asString(formData.get('penghasilanOrangTua'));
    const pernyataanOrangTua = asBoolean(formData.get('pernyataanOrangTua'));

    const orangTua = await prisma.dataOrangTua.upsert({
      where: { pendaftaranId: pendaftaran.id },
      update: {
        namaAyah,
        pekerjaanAyah,
        alamatDomisiliAyah,
        namaIbu,
        pekerjaanIbu,
        noHpOi,
        keadaanOrangTua: keadaanOrangTua as KeadaanOrangTua,
        penghasilanOrangTua,
        pernyataanOrangTua,
      },
      create: {
        pendaftaranId: pendaftaran.id,
        namaAyah,
        pekerjaanAyah,
        alamatDomisiliAyah,
        namaIbu,
        pekerjaanIbu,
        noHpOi,
        keadaanOrangTua: keadaanOrangTua as KeadaanOrangTua,
        penghasilanOrangTua,
        pernyataanOrangTua,
      },
    });

    revalidatePath('/dashboard-ppdb/dashboard/pendaftaran');
    return { success: true, data: orangTua };
  } catch (error) {
    console.error('saveDataOrangTuaAction error:', error);
    return { success: false, error: 'Gagal menyimpan data orang tua' };
  }
}

export async function saveDataSekolahAction(formData: FormData): Promise<FormResult> {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return { success: false, error: 'Tidak terautentikasi' };
    }

    const pendaftaran = await getOrCreatePendaftaran(user.userId);

    const namaSekolahAsal = asString(formData.get('namaSekolahAsal'));
    const npsnSekolah = asString(formData.get('npsnSekolah'));
    const statusSekolah = asString(formData.get('statusSekolah')) || 'NEGERI';
    const tahunLulus = asString(formData.get('tahunLulus'));
    const alamatSekolah = asString(formData.get('alamatSekolah'));

    const sekolah = await prisma.dataSekolahAsal.upsert({
      where: { pendaftaranId: pendaftaran.id },
      update: {
        namaSekolahAsal,
        npsnSekolah,
        statusSekolah: statusSekolah as StatusSekolah,
        tahunLulus,
        alamatSekolah,
      },
      create: {
        pendaftaranId: pendaftaran.id,
        namaSekolahAsal,
        npsnSekolah,
        statusSekolah: statusSekolah as StatusSekolah,
        tahunLulus,
        alamatSekolah,
      },
    });

    revalidatePath('/dashboard-ppdb/dashboard/pendaftaran');
    return { success: true, data: sekolah };
  } catch (error) {
    console.error('saveDataSekolahAction error:', error);
    return { success: false, error: 'Gagal menyimpan data sekolah asal' };
  }
}

export async function saveRekomendasiAction(formData: FormData): Promise<FormResult> {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return { success: false, error: 'Tidak terautentikasi' };
    }

    const pendaftaran = await getOrCreatePendaftaran(user.userId);

    const namaPemberiRekomendasi = asString(formData.get('namaPemberiRekomendasi')).trim();
    const jabatanInstansi = asString(formData.get('jabatanInstansi')).trim();
    const noHpPemberiRekomendasi = asString(formData.get('noHpPemberiRekomendasi')).trim();
    const existingRekomendasi = await prisma.suratRekomendasi.findUnique({
      where: { pendaftaranId: pendaftaran.id },
      select: { suratRekomendasiUrl: true },
    });

    const suratRekomendasiUrl = (await saveUploadedFile(
      formData.get('suratRekomendasiUrl'),
      user.userId,
      'surat-rekomendasi',
      existingRekomendasi?.suratRekomendasiUrl
    )) ?? '';
    const catatanRekomendasi = asString(formData.get('catatanRekomendasi')).trim();

    if (!namaPemberiRekomendasi) {
      return { success: false, error: 'Nama pemberi rekomendasi wajib diisi' };
    }

    const rekomendasi = await prisma.suratRekomendasi.upsert({
      where: { pendaftaranId: pendaftaran.id },
      update: {
        namaPemberiRekomendasi,
        jabatanInstansi,
        noHpPemberiRekomendasi,
        suratRekomendasiUrl,
        catatanRekomendasi,
      },
      create: {
        pendaftaranId: pendaftaran.id,
        namaPemberiRekomendasi,
        jabatanInstansi,
        noHpPemberiRekomendasi,
        suratRekomendasiUrl,
        catatanRekomendasi,
      },
    });

    revalidatePath('/dashboard-ppdb/dashboard/pendaftaran');
    return { success: true, data: rekomendasi };
  } catch (error) {
    console.error('saveRekomendasiAction error:', error);
    return { success: false, error: 'Gagal menyimpan data rekomendasi' };
  }
}

export async function uploadBerkasAction(formData: FormData): Promise<FormResult> {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return { success: false, error: 'Tidak terautentikasi' };
    }

    const pendaftaran = await getOrCreatePendaftaran(user.userId);

    const existingBerkas = await prisma.berkasPendaftaran.findUnique({
      where: { pendaftaranId: pendaftaran.id },
    });

    const kkUrl = await saveUploadedFile(formData.get('kkUrl'), user.userId, 'kk', existingBerkas?.kkUrl);
    const ktpOrangTuaUrl = await saveUploadedFile(formData.get('ktpOrangTuaUrl'), user.userId, 'ktp-orang-tua', existingBerkas?.ktpOrangTuaUrl);
    const kipUrl = await saveUploadedFile(formData.get('kipUrl'), user.userId, 'kip', existingBerkas?.kipUrl);
    const akteUrl = await saveUploadedFile(formData.get('akteUrl'), user.userId, 'akte', existingBerkas?.akteUrl);
    const ijazahUrl = await saveUploadedFile(formData.get('ijazahUrl'), user.userId, 'ijazah', existingBerkas?.ijazahUrl);
    const raporUrl = await saveUploadedFile(formData.get('raporUrl'), user.userId, 'rapor', existingBerkas?.raporUrl);
    const prestasiUrl = await saveUploadedFile(formData.get('prestasiUrl'), user.userId, 'prestasi', existingBerkas?.prestasiUrl);
    const tampakDepanRumahUrl = await saveUploadedFile(formData.get('tampakDepanRumahUrl'), user.userId, 'rumah-depan', existingBerkas?.tampakDepanRumahUrl);
    const tampakSampingRumahUrl = await saveUploadedFile(formData.get('tampakSampingRumahUrl'), user.userId, 'rumah-samping', existingBerkas?.tampakSampingRumahUrl);
    const kamarTidurUrl = await saveUploadedFile(formData.get('kamarTidurUrl'), user.userId, 'kamar-tidur', existingBerkas?.kamarTidurUrl);
    const ruangTamuUrl = await saveUploadedFile(formData.get('ruangTamuUrl'), user.userId, 'ruang-tamu', existingBerkas?.ruangTamuUrl);

    const berkas = await prisma.berkasPendaftaran.upsert({
      where: { pendaftaranId: pendaftaran.id },
      update: {
        kkUrl,
        ktpOrangTuaUrl,
        kipUrl,
        akteUrl,
        ijazahUrl,
        raporUrl,
        prestasiUrl,
        tampakDepanRumahUrl,
        tampakSampingRumahUrl,
        kamarTidurUrl,
        ruangTamuUrl,
      },
      create: {
        pendaftaranId: pendaftaran.id,
        kkUrl,
        ktpOrangTuaUrl,
        kipUrl,
        akteUrl,
        ijazahUrl,
        raporUrl,
        prestasiUrl,
        tampakDepanRumahUrl,
        tampakSampingRumahUrl,
        kamarTidurUrl,
        ruangTamuUrl,
      },
    });

    revalidatePath('/dashboard-ppdb/dashboard/pendaftaran');
    return { success: true, data: berkas };
  } catch (error) {
    console.error('uploadBerkasAction error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Gagal menyimpan berkas',
    };
  }
}

async function deleteFileSilently(fileUrl: string) {
  try {
    if (!fileUrl || typeof fileUrl !== 'string') return;
    const cleanUrl = fileUrl.replace(/^\/+/, '');
    if (!cleanUrl.startsWith('uploads/')) return;
    
    const absolutePath = path.join(process.cwd(), 'public', cleanUrl);
    await unlink(absolutePath);
  } catch (error) {
    console.warn(`[deleteFileSilently] Tidak dapat menghapus berkas lama di ${fileUrl}:`, error);
  }
}

async function saveUploadedFile(
  value: FormDataEntryValue | null,
  userId: string,
  fieldName: string,
  existingUrl: string | null | undefined
): Promise<string | null> {
  if (typeof value === 'string' && value.trim() !== '') {
    return value.trim();
  }

  if (!(value instanceof File) || value.size === 0) {
    return existingUrl ?? null;
  }

  if (value.size > 10 * 1024 * 1024) {
    throw new Error(`${fieldName} melebihi batas ukuran 10 MB`);
  }

  if (!isAllowedDocument(value)) {
    throw new Error(`${fieldName} harus berupa PDF atau gambar`);
  }

  const image = isImageFile(value);
  const extension = image ? '.webp' : path.extname(value.name).toLowerCase() || '.pdf';
  const fileName = `${fieldName}-${randomUUID()}${extension}`;
  const relativeDirectory = path.join('uploads', 'ppdb', userId);
  const absoluteDirectory = path.join(process.cwd(), 'public', relativeDirectory);

  await mkdir(absoluteDirectory, { recursive: true });
  const contents = image
    ? await convertImageToWebp(value)
    : Buffer.from(await value.arrayBuffer());
  await writeFile(path.join(absoluteDirectory, fileName), contents);

  const newUrl = `/${relativeDirectory.replaceAll(path.sep, '/')}/${fileName}`;

  // Hapus file lama jika ada file baru yang diunggah
  if (existingUrl && existingUrl !== newUrl) {
    await deleteFileSilently(existingUrl);
  }

  return newUrl;
}
export async function submitPendaftaranAction(): Promise<FormResult> {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return { success: false, error: 'Tidak terautentikasi' };
    }

    const pendaftaran = await prisma.pendaftaran.findUnique({
      where: { userId: user.userId },
      include: {
        biodata: true,
        orangTua: true,
        sekolahAsal: true,
        rekomendasi: true,
        berkas: true,
      },
    });

    if (!pendaftaran) {
      return { success: false, error: 'Data pendaftaran tidak ditemukan' };
    }

    if (!pendaftaran.biodata) {
      return { success: false, error: 'Data diri belum dilengkapi' };
    }

    const nomorPendaftaran = `PPDB-${Date.now()}-${user.userId.slice(0, 6)}`;

    const updated = await prisma.pendaftaran.update({
      where: { id: pendaftaran.id },
      data: {
        status: 'SUBMITTED',
        nomorPendaftaran,
      },
    });

    revalidatePath('/dashboard-ppdb/dashboard/pendaftaran');
    return { success: true, data: updated };
  } catch (error) {
    console.error('submitPendaftaranAction error:', error);
    return { success: false, error: 'Gagal submit pendaftaran' };
  }
}