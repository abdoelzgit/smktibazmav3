'use server';

import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/app/actions/auth';
import { revalidatePath } from 'next/cache';

const COOKIE_NAME = 'auth_session';

export type FormResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

async function getUserFromToken(): Promise<{ userId: string; email: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return null;
  }

  return { userId: payload.userId, email: payload.email };
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

    const namaLengkap = formData.get('namaLengkap') as string;
    const tempatLahir = formData.get('tempatLahir') as string;
    const tanggalLahirStr = formData.get('tanggalLahir') as string;
    const nik = formData.get('nik') as string;
    const nisn = formData.get('nisn') as string;
    const kewarganegaraan = formData.get('kewarganegaraan') as string;
    const anakKeStr = formData.get('anakKe') as string;
    const jumlahSaudaraStr = formData.get('jumlahSaudara') as string;
    const statusKeluarga = formData.get('statusKeluarga') as string;
    const tinggalBersama = formData.get('tinggalBersama') as string;
    const alamatLengkap = formData.get('alamatLengkap') as string;
    const noHpWhatsapp = formData.get('noHpWhatsapp') as string;
    const mediaSosial = formData.get('mediaSosial') as string;
    const bahasaAsing = formData.get('bahasaAsing') as string;
    const riwayatPrestasi = formData.get('riwayatPrestasi') as string;
    const riwayatOrganisasi = formData.get('riwayatOrganisasi') as string;
    const beratBadanStr = formData.get('beratBadan') as string;
    const tinggiBadanStr = formData.get('tinggiBadan') as string;
    const riwayatPenyakit = formData.get('riwayatPenyakit') as string;
    const isMerokok = formData.get('isMerokok') === 'true';
    const isButaWarna = formData.get('isButaWarna') === 'true';
    const hasPenyakitMenular = formData.get('hasPenyakitMenular') === 'true';
    const pernyataanSiswa = formData.get('pernyataanSiswa') === 'true';

    if (!namaLengkap) {
      return { success: false, error: 'Nama lengkap wajib diisi' };
    }

    const tanggalLahir = tanggalLahirStr ? new Date(tanggalLahirStr) : null;

    const biodata = await prisma.biodataSiswa.upsert({
      where: { pendaftaranId: pendaftaran.id },
      update: {
        namaLengkap,
        tempatLahir,
        tanggalLahir,
        nik,
        nisn,
        kewarganegaraan,
        anakKe: anakKeStr ? parseInt(anakKeStr, 10) : null,
        jumlahSaudara: jumlahSaudaraStr ? parseInt(jumlahSaudaraStr, 10) : null,
        statusKeluarga: (statusKeluarga as any) || 'ANAK_KANDUNG',
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
        tempatLahir,
        tanggalLahir,
        nik,
        nisn,
        kewarganegaraan,
        anakKe: anakKeStr ? parseInt(anakKeStr, 10) : null,
        jumlahSaudara: jumlahSaudaraStr ? parseInt(jumlahSaudaraStr, 10) : null,
        statusKeluarga: (statusKeluarga as any) || 'ANAK_KANDUNG',
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

    const namaAyah = formData.get('namaAyah') as string;
    const pekerjaanAyah = formData.get('pekerjaanAyah') as string;
    const alamatDomisiliAyah = formData.get('alamatDomisiliAyah') as string;
    const namaIbu = formData.get('namaIbu') as string;
    const pekerjaanIbu = formData.get('pekerjaanIbu') as string;
    const noHpOi = formData.get('noHpOi') as string;
    const keadaanOrangTua = formData.get('keadaanOrangTua') as string;
    const penghasilanOrangTua = formData.get('penghasilanOrangTua') as string;
    const pernyataanOrangTua = formData.get('pernyataanOrangTua') === 'true';

    const orangTua = await prisma.dataOrangTua.upsert({
      where: { pendaftaranId: pendaftaran.id },
      update: {
        namaAyah,
        pekerjaanAyah,
        alamatDomisiliAyah,
        namaIbu,
        pekerjaanIbu,
        noHpOi,
        keadaanOrangTua: (keadaanOrangTua as any) || 'LENGKAP',
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
        keadaanOrangTua: (keadaanOrangTua as any) || 'LENGKAP',
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

    const namaSekolahAsal = formData.get('namaSekolahAsal') as string;
    const npsnSekolah = formData.get('npsnSekolah') as string;
    const statusSekolah = formData.get('statusSekolah') as string;
    const tahunLulus = formData.get('tahunLulus') as string;
    const alamatSekolah = formData.get('alamatSekolah') as string;

    const sekolah = await prisma.dataSekolahAsal.upsert({
      where: { pendaftaranId: pendaftaran.id },
      update: {
        namaSekolahAsal,
        npsnSekolah,
        statusSekolah: (statusSekolah as any) || 'NEGERI',
        tahunLulus,
        alamatSekolah,
      },
      create: {
        pendaftaranId: pendaftaran.id,
        namaSekolahAsal,
        npsnSekolah,
        statusSekolah: (statusSekolah as any) || 'NEGERI',
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

    const namaPemberiRekomendasi = formData.get('namaPemberiRekomendasi') as string;
    const jabatanInstansi = formData.get('jabatanInstansi') as string;
    const noHpPemberiRekomendasi = formData.get('noHpPemberiRekomendasi') as string;
    const suratRekomendasiUrl = formData.get('suratRekomendasiUrl') as string;
    const catatanRekomendasi = formData.get('catatanRekomendasi') as string;

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

    const kkUrl = formData.get('kkUrl') as string;
    const ktpOrangTuaUrl = formData.get('ktpOrangTuaUrl') as string;
    const kipUrl = formData.get('kipUrl') as string;
    const akteUrl = formData.get('akteUrl') as string;
    const ijazahUrl = formData.get('ijazahUrl') as string;
    const raporUrl = formData.get('raporUrl') as string;
    const prestasiUrl = formData.get('prestasiUrl') as string;
    const tampakDepanRumahUrl = formData.get('tampakDepanRumahUrl') as string;
    const tampakSampingRumahUrl = formData.get('tampakSampingRumahUrl') as string;
    const kamarTidurUrl = formData.get('kamarTidurUrl') as string;
    const ruangTamuUrl = formData.get('ruangTamuUrl') as string;

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
    return { success: false, error: 'Gagal menyimpan berkas' };
  }
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