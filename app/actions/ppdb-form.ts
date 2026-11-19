'use server';

import { KeadaanOrangTua, StatusKeluarga, StatusSekolah, StatusPendaftaran } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { riwayatSiswaSchema } from '@/lib/validations/ppdb-form';
import { toPhoneInputValue } from '@/lib/phone-input-value';
import { getPPDBUserFromToken } from '@/lib/ppdb-auth';
import { getOrCreatePendaftaran } from '@/lib/ppdb-registration';
import {
  cleanupNewFile,
  cleanupStaleFile,
  deleteFileSilently,
  saveUploadedFile,
  type SavedFile,
} from '@/lib/ppdb-upload';

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

export async function saveDataDiriAction(formData: FormData): Promise<FormResult> {
  let fotoFormalFile: SavedFile | null = null;
  let biodataCommitted = false;

  try {
    const user = await getPPDBUserFromToken();
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
    fotoFormalFile = await saveUploadedFile(
      formData.get('fotoFormalUrl'),
      user.userId,
      'foto-formal',
      existingBiodata?.fotoFormalUrl,
    );
    const fotoFormalUrl = fotoFormalFile.url;

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
    biodataCommitted = true;
    await cleanupStaleFile(fotoFormalFile);

    await checkAndAutoVerifyPendaftaran(pendaftaran.id);
    revalidatePath('/spmb/form');
    return { success: true, data: biodata };
  } catch (error) {
    if (biodataCommitted) await cleanupStaleFile(fotoFormalFile);
    else await cleanupNewFile(fotoFormalFile);
    console.error('saveDataDiriAction error:', error);
    return { success: false, error: 'Gagal menyimpan data diri' };
  }
}

export async function saveRiwayatSiswaAction(formData: FormData): Promise<FormResult> {
  const savedFiles: SavedFile[] = [];
  let riwayatCommitted = false;

  try {
    const user = await getPPDBUserFromToken();
    if (!user) return { success: false, error: 'Tidak terautentikasi' };
    const pendaftaran = await getOrCreatePendaftaran(user.userId);
    const parsed = riwayatSiswaSchema.safeParse({
      riwayatPrestasiItems: JSON.parse(asString(formData.get('riwayatPrestasiItems')) || '[]'),
      riwayatOrganisasiItems: JSON.parse(asString(formData.get('riwayatOrganisasiItems')) || '[]'),
      riwayatBahasaItems: JSON.parse(asString(formData.get('riwayatBahasaItems')) || '[]'),
    });
    if (!parsed.success) return { success: false, error: 'Periksa kembali data riwayat yang diisi.' };

    const previous = await prisma.riwayatPendaftar.findUnique({ where: { pendaftaranId: pendaftaran.id } });
    const prestasiItems = [];
    for (const [index, item] of parsed.data.riwayatPrestasiItems.entries()) {
      const savedFile = await saveUploadedFile(
        formData.get(`bukti-${item.id}`),
        user.userId,
        `bukti-prestasi-${index + 1}`,
        item.buktiUrl,
      );
      savedFiles.push(savedFile);
      prestasiItems.push({ ...item, buktiUrl: savedFile.url });
    }
    const saved = await prisma.riwayatPendaftar.upsert({
      where: { pendaftaranId: pendaftaran.id },
      create: { pendaftaranId: pendaftaran.id, prestasiData: prestasiItems, organisasiData: parsed.data.riwayatOrganisasiItems, bahasaData: parsed.data.riwayatBahasaItems },
      update: { prestasiData: prestasiItems, organisasiData: parsed.data.riwayatOrganisasiItems, bahasaData: parsed.data.riwayatBahasaItems },
    });
    riwayatCommitted = true;
    const retained = new Set(prestasiItems.map((item) => item.buktiUrl).filter(Boolean));
    if (Array.isArray(previous?.prestasiData)) {
      const oldItems = previous.prestasiData as { buktiUrl?: string }[];
      await Promise.all(oldItems.map((item) => item.buktiUrl && !retained.has(item.buktiUrl) ? deleteFileSilently(item.buktiUrl) : undefined));
    }
    await Promise.all(savedFiles.map(cleanupStaleFile));
    revalidatePath('/spmb/form');
    return { success: true, data: { ...saved, ...parsed.data, riwayatPrestasiItems: prestasiItems } };
  } catch {
    await Promise.all(
      savedFiles.map((file) => riwayatCommitted ? cleanupStaleFile(file) : cleanupNewFile(file)),
    );
    return { success: false, error: 'Gagal menyimpan riwayat.' };
  }
}

export async function saveDataOrangTuaAction(formData: FormData): Promise<FormResult> {
  try {
    const user = await getPPDBUserFromToken();
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
    revalidatePath('/spmb/form');
    return { success: true, data: orangTua };
  } catch (error) {
    console.error('saveDataOrangTuaAction error:', error);
    return { success: false, error: 'Gagal menyimpan data orang tua' };
  }
}

export async function saveDataSekolahAction(formData: FormData): Promise<FormResult> {
  try {
    const user = await getPPDBUserFromToken();
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
    revalidatePath('/spmb/form');
    return { success: true, data: sekolah };
  } catch (error) {
    console.error('saveDataSekolahAction error:', error);
    return { success: false, error: 'Gagal menyimpan data sekolah asal' };
  }
}

export async function saveRekomendasiAction(formData: FormData): Promise<FormResult> {
  let recommendationFile: SavedFile | null = null;
  let recommendationCommitted = false;

  try {
    const user = await getPPDBUserFromToken();
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

    const catatanRekomendasi = asString(formData.get('catatanRekomendasi')).trim();

    if (!namaPemberiRekomendasi) {
      return { success: false, error: 'Nama pemberi rekomendasi wajib diisi' };
    }

    recommendationFile = await saveUploadedFile(
      formData.get('suratRekomendasiUrl'),
      user.userId,
      'surat-rekomendasi',
      existingRekomendasi?.suratRekomendasiUrl,
    );
    const suratRekomendasiUrl = recommendationFile.url ?? '';

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
    recommendationCommitted = true;
    await cleanupStaleFile(recommendationFile);

    await checkAndAutoVerifyPendaftaran(pendaftaran.id);
    revalidatePath('/spmb/form');
    return { success: true, data: rekomendasi };
  } catch (error) {
    if (recommendationCommitted) await cleanupStaleFile(recommendationFile);
    else await cleanupNewFile(recommendationFile);
    console.error('saveRekomendasiAction error:', error);
    return { success: false, error: 'Gagal menyimpan data rekomendasi' };
  }
}

export async function submitPendaftaranAction(): Promise<FormResult> {
  try {
    const user = await getPPDBUserFromToken();
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
    revalidatePath('/spmb/form');
    return { success: true, data: updated };
  } catch (error) {
    console.error('submitPendaftaranAction error:', error);
    return { success: false, error: 'Gagal submit pendaftaran' };
  }
}
