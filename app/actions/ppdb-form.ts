'use server';

import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { mkdir, writeFile, unlink } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { KeadaanOrangTua, StatusKeluarga, StatusSekolah, StatusPendaftaran } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/app/actions/auth';
import { revalidatePath } from 'next/cache';
import { convertImageToWebp, isAllowedDocument, isImageFile } from '@/lib/image.utils';
import { getRelativeUploadPath, resolveUploadPath, toUploadUrl } from '@/lib/upload-storage';
import { riwayatSiswaSchema } from '@/lib/validations/ppdb-form';
import { toPhoneInputValue } from '@/lib/phone-input-value';
import { schedulePpdbSheetSync } from '@/lib/ppdb-google-sheets';

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

async function checkAndAutoVerifyPendaftaran(pendaftaranId: string) {
  const p = await prisma.pendaftaran.findUnique({
    where: { id: pendaftaranId },
    include: {
      biodata: true,
      orangTua: true,
      sekolahAsal: true,
      rekomendasi: true,
      berkas: true,
    },
  });

  if (!p) return;

  // A draft must remain editable until the participant explicitly finalizes it.
  if (p.status !== StatusPendaftaran.SUBMITTED) return;

  const isAllTabsComplete = Boolean(
    p.biodata && p.orangTua && p.sekolahAsal && p.rekomendasi && p.berkas
  );

  if (isAllTabsComplete) {
    await prisma.pendaftaran.update({
      where: { id: pendaftaranId },
      data: { status: StatusPendaftaran.VERIFIED },
    });
  }
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

  // Older saves could be marked VERIFIED automatically before a registration number
  // was assigned. Restore only those records; explicit finalization assigns a number.
  if (pendaftaran?.status === 'VERIFIED' && !pendaftaran.nomorPendaftaran) {
    pendaftaran = await prisma.pendaftaran.update({
      where: { id: pendaftaran.id },
      data: { status: 'DRAFT' },
    });
  }

  if (pendaftaran && ['SUBMITTED', 'VERIFIED', 'ACCEPTED'].includes(pendaftaran.status)) {
    throw new Error('Pendaftaran sudah difinalisasi dan tidak dapat diubah.');
  }

  if (!pendaftaran) {
    pendaftaran = await prisma.pendaftaran.create({
      data: {
        userId,
        status: 'DRAFT',
      },
    });
    await schedulePpdbSheetSync(pendaftaran.id);
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
      select: {
        fotoFormalUrl: true,
        bahasaAsing: true,
        riwayatPrestasi: true,
        riwayatOrganisasi: true,
      },
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
    const anakKeRaw = asString(formData.get('anakKe'));
    const jumlahSaudaraRaw = asString(formData.get('jumlahSaudara'));

    let anakKeVal: number | null = null;
    let jumlahSaudaraVal: number | null = null;

    if (anakKeRaw) {
      // Parsing format input "2 / 3", "2/3", "2 dari 3", dsb.
      const match = anakKeRaw.match(/^(\d+)\s*(?:[/\\-]|dari)\s*(\d+)$/i);
      if (match) {
        anakKeVal = parseInt(match[1], 10);
        jumlahSaudaraVal = parseInt(match[2], 10);
      } else {
        const parsed = parseInt(anakKeRaw, 10);
        anakKeVal = isNaN(parsed) ? null : parsed;
      }
    }

    if (!jumlahSaudaraVal && jumlahSaudaraRaw) {
      const parsed = parseInt(jumlahSaudaraRaw, 10);
      jumlahSaudaraVal = isNaN(parsed) ? null : parsed;
    }
    const statusKeluarga = asString(formData.get('statusKeluarga')) || 'ANAK_KANDUNG';
    const tinggalBersama = asString(formData.get('tinggalBersama'));
    const alamatLengkap = asString(formData.get('alamatLengkap'));
    const noHpWhatsapp = toPhoneInputValue(formData.get('noHpWhatsapp')) ?? '';
    const mediaSosial = asString(formData.get('mediaSosial'));
    const linkPengumpulanVideo = asString(formData.get('linkPengumpulanVideo'));
    const setujuPanduanVideo = asBoolean(formData.get('setujuPanduanVideo'));
    const bahasaAsing = formData.has('bahasaAsing')
      ? asString(formData.get('bahasaAsing'))
      : existingBiodata?.bahasaAsing ?? '';
    const riwayatPrestasi = formData.has('riwayatPrestasi')
      ? asString(formData.get('riwayatPrestasi'))
      : existingBiodata?.riwayatPrestasi ?? '';
    const riwayatOrganisasi = formData.has('riwayatOrganisasi')
      ? asString(formData.get('riwayatOrganisasi'))
      : existingBiodata?.riwayatOrganisasi ?? '';
    const beratBadanStr = asString(formData.get('beratBadan'));
    const tinggiBadanStr = asString(formData.get('tinggiBadan'));
    const riwayatPenyakit = asString(formData.get('riwayatPenyakit'));
    const isMerokok = asBoolean(formData.get('isMerokok'));
    const isButaWarna = asBoolean(formData.get('isButaWarna'));
    const hasPenyakitMenular = asBoolean(formData.get('hasPenyakitMenular'));
    const pernyataanSiswa = asBoolean(formData.get('pernyataanSiswa'));

    if (!setujuPanduanVideo) {
      return { success: false, error: 'Persetujuan membaca panduan video wajib dicentang' };
    }
    if (!pernyataanSiswa) {
      return { success: false, error: 'Pernyataan calon siswa harus disetujui sebelum data disimpan' };
    }

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
        anakKe: anakKeVal,
        jumlahSaudara: jumlahSaudaraVal,
        statusKeluarga: statusKeluarga as StatusKeluarga,
        tinggalBersama,
        alamatLengkap,
        noHpWhatsapp,
        mediaSosial,
        linkPengumpulanVideo,
        setujuPanduanVideo,
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
        anakKe: anakKeVal,
        jumlahSaudara: jumlahSaudaraVal,
        statusKeluarga: statusKeluarga as StatusKeluarga,
        tinggalBersama,
        alamatLengkap,
        noHpWhatsapp,
        mediaSosial,
        linkPengumpulanVideo,
        setujuPanduanVideo,
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

    await checkAndAutoVerifyPendaftaran(pendaftaran.id);
    await schedulePpdbSheetSync(pendaftaran.id);
    revalidatePath('/spmb/form');
    return { success: true, data: biodata };
  } catch (error) {
    console.error('saveDataDiriAction error:', error);
    return { success: false, error: 'Gagal menyimpan data diri' };
  }
}

export async function saveRiwayatSiswaAction(formData: FormData): Promise<FormResult> {
  try {
    const user = await getUserFromToken();
    if (!user) return { success: false, error: 'Tidak terautentikasi' };
    const pendaftaran = await getOrCreatePendaftaran(user.userId);
    const parsed = riwayatSiswaSchema.safeParse({
      riwayatPrestasiItems: JSON.parse(asString(formData.get('riwayatPrestasiItems')) || '[]'),
      riwayatOrganisasiItems: JSON.parse(asString(formData.get('riwayatOrganisasiItems')) || '[]'),
      riwayatBahasaItems: JSON.parse(asString(formData.get('riwayatBahasaItems')) || '[]'),
    });
    if (!parsed.success) return { success: false, error: 'Periksa kembali data riwayat yang diisi.' };

    const previous = await prisma.riwayatPendaftar.findUnique({ where: { pendaftaranId: pendaftaran.id } });
    const prestasiItems = await Promise.all(parsed.data.riwayatPrestasiItems.map(async (item, index) => ({
      ...item,
      buktiUrl: await saveUploadedFile(formData.get(`bukti-${item.id}`), user.userId, `bukti-prestasi-${index + 1}`, item.buktiUrl),
    })));
    const saved = await prisma.riwayatPendaftar.upsert({
      where: { pendaftaranId: pendaftaran.id },
      create: { pendaftaranId: pendaftaran.id, prestasiData: prestasiItems, organisasiData: parsed.data.riwayatOrganisasiItems, bahasaData: parsed.data.riwayatBahasaItems },
      update: { prestasiData: prestasiItems, organisasiData: parsed.data.riwayatOrganisasiItems, bahasaData: parsed.data.riwayatBahasaItems },
    });
    const retained = new Set(prestasiItems.map((item) => item.buktiUrl).filter(Boolean));
    if (Array.isArray(previous?.prestasiData)) {
      const oldItems = previous.prestasiData as { buktiUrl?: string }[];
      await Promise.all(oldItems.map((item) => item.buktiUrl && !retained.has(item.buktiUrl) ? deleteFileSilently(item.buktiUrl) : undefined));
    }
    await schedulePpdbSheetSync(pendaftaran.id);
    revalidatePath('/spmb/form');
    return { success: true, data: { ...saved, ...parsed.data, riwayatPrestasiItems: prestasiItems } };
  } catch {
    return { success: false, error: 'Gagal menyimpan riwayat.' };
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
    const noHpOi = toPhoneInputValue(formData.get('noHpOi')) ?? '';
    const keadaanOrangTua = asString(formData.get('keadaanOrangTua')) || 'LENGKAP';
    const penghasilanOrangTua = asString(formData.get('penghasilanOrangTua'));
    const pernyataanOrangTua = asBoolean(formData.get('pernyataanOrangTua'));

    if (!pernyataanOrangTua) {
      return { success: false, error: 'Pernyataan orang tua/wali harus disetujui sebelum data disimpan' };
    }

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

    await checkAndAutoVerifyPendaftaran(pendaftaran.id);
    await schedulePpdbSheetSync(pendaftaran.id);
    revalidatePath('/spmb/form');
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

    await checkAndAutoVerifyPendaftaran(pendaftaran.id);
    await schedulePpdbSheetSync(pendaftaran.id);
    revalidatePath('/spmb/form');
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
    const noHpPemberiRekomendasi = toPhoneInputValue(formData.get('noHpPemberiRekomendasi')) ?? '';
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

    await checkAndAutoVerifyPendaftaran(pendaftaran.id);
    await schedulePpdbSheetSync(pendaftaran.id);
    revalidatePath('/spmb/form');
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

    const fields = [
      { key: 'kkUrl', fieldName: 'kk', existingUrl: existingBerkas?.kkUrl },
      { key: 'ktpOrangTuaUrl', fieldName: 'ktp-orang-tua', existingUrl: existingBerkas?.ktpOrangTuaUrl },
      { key: 'kipUrl', fieldName: 'kip', existingUrl: existingBerkas?.kipUrl },
      { key: 'akteUrl', fieldName: 'akte', existingUrl: existingBerkas?.akteUrl },
      { key: 'ijazahUrl', fieldName: 'ijazah', existingUrl: existingBerkas?.ijazahUrl },
      { key: 'raporUrl', fieldName: 'rapor', existingUrl: existingBerkas?.raporUrl },
      { key: 'prestasiUrl', fieldName: 'prestasi', existingUrl: existingBerkas?.prestasiUrl },
      { key: 'bpjsUrl', fieldName: 'bpjs', existingUrl: existingBerkas?.bpjsUrl },
      { key: 'sktmUrl', fieldName: 'sktm', existingUrl: existingBerkas?.sktmUrl },
      { key: 'suratPernyataanCpdbUrl', fieldName: 'pernyataan-cpdb', existingUrl: existingBerkas?.suratPernyataanCpdbUrl },
      { key: 'suratTidakMerokokUrl', fieldName: 'pernyataan-tidak-merokok', existingUrl: existingBerkas?.suratTidakMerokokUrl },
      { key: 'tampakDepanRumahUrl', fieldName: 'rumah-depan', existingUrl: existingBerkas?.tampakDepanRumahUrl },
      { key: 'tampakSampingRumahUrl', fieldName: 'rumah-samping', existingUrl: existingBerkas?.tampakSampingRumahUrl },
      { key: 'kamarTidurUrl', fieldName: 'kamar-tidur', existingUrl: existingBerkas?.kamarTidurUrl },
      { key: 'kamarMandiUrl', fieldName: 'kamar-mandi', existingUrl: existingBerkas?.kamarMandiUrl },
      { key: 'ruangTamuUrl', fieldName: 'ruang-tamu', existingUrl: existingBerkas?.ruangTamuUrl },
    ] as const;
    const savedUrls: Record<string, string | null> = {};

    for (let index = 0; index < fields.length; index += 2) {
      const batch = fields.slice(index, index + 2);
      const batchResults = await Promise.all(batch.map(async (field) => ({
        key: field.key,
        url: await saveUploadedFile(
          formData.get(field.key),
          user.userId,
          field.fieldName,
          field.existingUrl,
        ),
      })));
      batchResults.forEach(({ key, url }) => {
        savedUrls[key] = url;
      });
    }

    const kkUrl = savedUrls.kkUrl;
    const ktpOrangTuaUrl = savedUrls.ktpOrangTuaUrl;
    const kipUrl = savedUrls.kipUrl;
    const akteUrl = savedUrls.akteUrl;
    const ijazahUrl = savedUrls.ijazahUrl;
    const raporUrl = savedUrls.raporUrl;
    const prestasiUrl = savedUrls.prestasiUrl;
    const bpjsUrl = savedUrls.bpjsUrl;
    const sktmUrl = savedUrls.sktmUrl;
    const suratPernyataanCpdbUrl = savedUrls.suratPernyataanCpdbUrl;
    const suratTidakMerokokUrl = savedUrls.suratTidakMerokokUrl;
    const tampakDepanRumahUrl = savedUrls.tampakDepanRumahUrl;
    const tampakSampingRumahUrl = savedUrls.tampakSampingRumahUrl;
    const kamarTidurUrl = savedUrls.kamarTidurUrl;
    const kamarMandiUrl = savedUrls.kamarMandiUrl;
    const ruangTamuUrl = savedUrls.ruangTamuUrl;

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
        bpjsUrl,
        sktmUrl,
        suratPernyataanCpdbUrl,
        suratTidakMerokokUrl,
        tampakDepanRumahUrl,
        tampakSampingRumahUrl,
        kamarTidurUrl,
        kamarMandiUrl,
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
        bpjsUrl,
        sktmUrl,
        suratPernyataanCpdbUrl,
        suratTidakMerokokUrl,
        tampakDepanRumahUrl,
        tampakSampingRumahUrl,
        kamarTidurUrl,
        kamarMandiUrl,
        ruangTamuUrl,
      },
    });

    await checkAndAutoVerifyPendaftaran(pendaftaran.id);
    await schedulePpdbSheetSync(pendaftaran.id);
    revalidatePath('/spmb/form');
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
    const relativePath = getRelativeUploadPath(fileUrl);
    if (!relativePath) return;

    const absolutePath = resolveUploadPath(relativePath);
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
  const isWebp = image && (value.type === 'image/webp' || path.extname(value.name).toLowerCase() === '.webp');
  const extension = image ? '.webp' : path.extname(value.name).toLowerCase() || '.pdf';
  const fileName = `${fieldName}-${randomUUID()}${extension}`;
  const relativeDirectory = path.join('ppdb', userId);
  const absoluteDirectory = resolveUploadPath(relativeDirectory);

  await mkdir(absoluteDirectory, { recursive: true });
  const contents = image && !isWebp
    ? await convertImageToWebp(value)
    : Buffer.from(await value.arrayBuffer());
  await writeFile(path.join(absoluteDirectory, fileName), contents);

  const newUrl = toUploadUrl(path.join(relativeDirectory, fileName));

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
        riwayat: true,
      },
    });

    if (!pendaftaran) {
      return { success: false, error: 'Data pendaftaran tidak ditemukan' };
    }

    if (['SUBMITTED', 'VERIFIED', 'ACCEPTED'].includes(pendaftaran.status)) {
      return { success: false, error: 'Pendaftaran sudah difinalisasi.' };
    }

    if (!pendaftaran.biodata?.namaLengkap || !pendaftaran.biodata.tempatLahir || !pendaftaran.biodata.alamatLengkap) {
      return { success: false, error: 'Lengkapi nama, tempat lahir, dan alamat di tab Data Diri sebelum finalisasi.' };
    }
    if (!pendaftaran.rekomendasi?.namaPemberiRekomendasi) {
      return { success: false, error: 'Lengkapi Surat Rekomendasi sebelum finalisasi.' };
    }
    if (!pendaftaran.orangTua || !pendaftaran.sekolahAsal || !pendaftaran.berkas || !pendaftaran.riwayat) {
      return { success: false, error: 'Simpan semua tab formulir sebelum finalisasi.' };
    }

    const nomorPendaftaran = pendaftaran.nomorPendaftaran ?? `PPDB-${Date.now()}-${user.userId.slice(0, 6)}`;

    const updated = await prisma.pendaftaran.update({
      where: { id: pendaftaran.id },
      data: {
        status: 'SUBMITTED',
        nomorPendaftaran,
      },
    });

    await checkAndAutoVerifyPendaftaran(pendaftaran.id);
    await schedulePpdbSheetSync(pendaftaran.id);
    revalidatePath('/spmb/form');
    return { success: true, data: updated };
  } catch (error) {
    console.error('submitPendaftaranAction error:', error);
    return { success: false, error: 'Gagal submit pendaftaran' };
  }
}
