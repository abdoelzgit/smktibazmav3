'use server';

import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/app/actions/auth';

const COOKIE_NAME = 'auth_session';

export type DashboardPpdbData = {
  siswa: {
    nama: string;
    noHp: string;
    domisili: string;
    tanggalDaftar: string;
    sekolahAsal?: string;
    nisn?: string;
    foto?: string | null;
  };
  progressItems: Array<{
    title: string;
    tab: string;
    saved: boolean;
    verified: boolean;
  }>;
  currentStep: number;
};

export async function getDashboardPpdbData(): Promise<DashboardPpdbData | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  const user = await verifyToken(token);
  if (!user) {
    return null;
  }

  const pendaftaran = await prisma.pendaftaran.findUnique({
    where: { userId: user.userId },
    include: {
      biodata: true,
      orangTua: true,
      berkas: true,
      rekomendasi: true,
      sekolahAsal: true,
      riwayat: true,
    },
  });

  const biodata = pendaftaran?.biodata;
  const hasValues = (values: unknown[]) => values.every((value) =>
    typeof value === 'boolean' || (typeof value === 'string' && value.trim().length > 0) || (typeof value === 'number' && Number.isFinite(value))
  );
  const historyIsComplete = (value: unknown, requiredFields: string[]) => Array.isArray(value) && value.every((item) =>
    typeof item === 'object' && item !== null && requiredFields.every((field) => {
      const property = (item as Record<string, unknown>)[field];
      return typeof property === 'string' && property.trim().length > 0;
    })
  );
  const progressItems = [
    { title: 'Data Diri', tab: 'Data Diri', saved: Boolean(biodata), verified: Boolean(biodata && hasValues([biodata.namaLengkap, biodata.email, biodata.tempatLahir, biodata.tanggalLahir?.toISOString(), biodata.nik, biodata.nisn, biodata.kewarganegaraan, biodata.anakKe, biodata.jumlahSaudara, biodata.statusKeluarga, biodata.tinggalBersama, biodata.alamatLengkap, biodata.noHpWhatsapp, biodata.mediaSosial, biodata.linkPengumpulanVideo, biodata.beratBadan, biodata.tinggiBadan, biodata.riwayatPenyakit, biodata.isMerokok, biodata.isButaWarna, biodata.hasPenyakitMenular, biodata.pernyataanSiswa, biodata.fotoFormalUrl])) },
    { title: 'Riwayat', tab: 'Riwayat', saved: Boolean(pendaftaran?.riwayat), verified: Boolean(pendaftaran?.riwayat && historyIsComplete(pendaftaran.riwayat.prestasiData, ['nama','tingkat','tanggal','buktiUrl']) && historyIsComplete(pendaftaran.riwayat.organisasiData, ['nama','jabatan','periode']) && historyIsComplete(pendaftaran.riwayat.bahasaData, ['nama','tingkat'])) },
    { title: 'Data Orang Tua', tab: 'Data orang Tua', saved: Boolean(pendaftaran?.orangTua), verified: Boolean(pendaftaran?.orangTua && hasValues([pendaftaran.orangTua.namaAyah, pendaftaran.orangTua.pekerjaanAyah, pendaftaran.orangTua.alamatDomisiliAyah, pendaftaran.orangTua.namaIbu, pendaftaran.orangTua.pekerjaanIbu, pendaftaran.orangTua.noHpOi, pendaftaran.orangTua.keadaanOrangTua, pendaftaran.orangTua.penghasilanOrangTua, pendaftaran.orangTua.pernyataanOrangTua])) },
    { title: 'Sekolah Asal', tab: 'Data sekolah Asal', saved: Boolean(pendaftaran?.sekolahAsal), verified: Boolean(pendaftaran?.sekolahAsal && hasValues([pendaftaran.sekolahAsal.namaSekolahAsal, pendaftaran.sekolahAsal.npsnSekolah, pendaftaran.sekolahAsal.statusSekolah, pendaftaran.sekolahAsal.tahunLulus, pendaftaran.sekolahAsal.alamatSekolah])) },
    { title: 'Dokumen', tab: 'Berkas', saved: Boolean(pendaftaran?.berkas), verified: Boolean(pendaftaran?.berkas && hasValues([pendaftaran.berkas.kkUrl, pendaftaran.berkas.ktpOrangTuaUrl, pendaftaran.berkas.kipUrl, pendaftaran.berkas.akteUrl, pendaftaran.berkas.ijazahUrl, pendaftaran.berkas.raporUrl, pendaftaran.berkas.bpjsUrl, pendaftaran.berkas.sktmUrl, pendaftaran.berkas.suratPernyataanWaliUrl, pendaftaran.berkas.suratPernyataanCpdbUrl, pendaftaran.berkas.suratTidakMerokokUrl, pendaftaran.berkas.tampakDepanRumahUrl, pendaftaran.berkas.tampakSampingRumahUrl, pendaftaran.berkas.kamarTidurUrl, pendaftaran.berkas.kamarMandiUrl, pendaftaran.berkas.ruangTamuUrl])) },
    { title: 'Surat Rekomendasi', tab: 'Surat Rekomendasi', saved: Boolean(pendaftaran?.rekomendasi), verified: Boolean(pendaftaran?.rekomendasi && hasValues([pendaftaran.rekomendasi.namaPemberiRekomendasi, pendaftaran.rekomendasi.jabatanInstansi, pendaftaran.rekomendasi.noHpPemberiRekomendasi, pendaftaran.rekomendasi.suratRekomendasiUrl, pendaftaran.rekomendasi.catatanRekomendasi])) },
    { title: 'Finalisasi', tab: 'Finalisasi', saved: Boolean(pendaftaran && ['SUBMITTED', 'VERIFIED', 'ACCEPTED'].includes(pendaftaran.status)), verified: Boolean(pendaftaran && ['SUBMITTED', 'VERIFIED', 'ACCEPTED'].includes(pendaftaran.status)) },
  ];
  const completedItems = progressItems.filter((item) => item.verified).length;

  return {
    siswa: {
      nama: biodata?.namaLengkap ?? user.name ?? user.email,
      noHp: biodata?.noHpWhatsapp ?? '-',
      domisili: biodata?.alamatLengkap ?? '-',
      tanggalDaftar: pendaftaran
        ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(pendaftaran.createdAt)
        : '-',
      sekolahAsal: pendaftaran?.sekolahAsal?.namaSekolahAsal ?? '-',
      nisn: biodata?.nisn ?? '-',
      foto: biodata?.fotoFormalUrl ?? null,
    },
    progressItems,
    currentStep: Math.min(completedItems + 1, 6),
  };
}
