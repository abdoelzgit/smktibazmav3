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
    },
  });

  const biodata = pendaftaran?.biodata;
  const progressItems = [
    { title: 'Biodata Diri', verified: Boolean(biodata) },
    { title: 'Data Orang Tua', verified: Boolean(pendaftaran?.orangTua) },
    { title: 'Unggah Berkas', verified: Boolean(pendaftaran?.berkas) },
    { title: 'Surat Rekomendasi', verified: Boolean(pendaftaran?.rekomendasi) },
    { title: 'Asal Sekolah', verified: Boolean(pendaftaran?.sekolahAsal) },
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