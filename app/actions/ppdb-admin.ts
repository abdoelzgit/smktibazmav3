'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { StatusPendaftaran } from '@prisma/client';

export type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type PesertaAdminData = {
  id: string;
  nomorPendaftaran: string;
  nisn: string;
  nama: string;
  email: string;
  noHp: string;
  alamat: string;
  nik: string;
  sekolahAsal: string;
  npsnSekolah: string;
  tanggalDaftar: string;
  status: "Belum Diverifikasi" | "Sudah Diverifikasi";
  rawStatus: StatusPendaftaran;
  fotoFormalUrl?: string | null;
  namaAyah?: string | null;
  namaIbu?: string | null;
  noHpOrangTua?: string | null;
  berkasCount: number;
};

export async function getPendaftaranPpdbListAction(): Promise<ActionResult<PesertaAdminData[]>> {
  try {
    const list = await prisma.pendaftaran.findMany({
      include: {
        user: { select: { name: true, email: true } },
        biodata: true,
        sekolahAsal: true,
        orangTua: true,
        berkas: true,
        rekomendasi: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedList: PesertaAdminData[] = await Promise.all(
      list.map(async (item) => {
        const isAllTabsComplete = Boolean(
          item.biodata && item.orangTua && item.sekolahAsal && item.rekomendasi && item.berkas
        );

        if (isAllTabsComplete) {
          if (item.status !== StatusPendaftaran.VERIFIED && item.status !== StatusPendaftaran.ACCEPTED) {
            await prisma.pendaftaran.update({
              where: { id: item.id },
              data: { status: StatusPendaftaran.VERIFIED },
            });
          }
        } else {
          if (item.status === StatusPendaftaran.VERIFIED) {
            await prisma.pendaftaran.update({
              where: { id: item.id },
              data: { status: StatusPendaftaran.SUBMITTED },
            });
          }
        }

        const isVerified = isAllTabsComplete || item.status === StatusPendaftaran.VERIFIED || item.status === StatusPendaftaran.ACCEPTED;
        const berkasUploaded = item.berkas
          ? Object.values(item.berkas).filter((v) => typeof v === 'string' && v.startsWith('http')).length
          : 0;

        return {
          id: item.id,
          nomorPendaftaran: item.nomorPendaftaran || item.id.slice(-6).toUpperCase(),
          nisn: item.biodata?.nisn || '-',
          nama: item.biodata?.namaLengkap || item.user.name || 'Pendaftar Baru',
          email: item.biodata?.email || item.user.email || '-',
          noHp: item.biodata?.noHpWhatsapp || item.orangTua?.noHpOi || '-',
          alamat: item.biodata?.alamatLengkap || '-',
          nik: item.biodata?.nik || '-',
          sekolahAsal: item.sekolahAsal?.namaSekolahAsal || '-',
          npsnSekolah: item.sekolahAsal?.npsnSekolah || '-',
          tanggalDaftar: new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(item.createdAt),
          status: isVerified ? 'Sudah Diverifikasi' : 'Belum Diverifikasi',
          rawStatus: isVerified ? StatusPendaftaran.VERIFIED : item.status,
          fotoFormalUrl: item.biodata?.fotoFormalUrl,
          namaAyah: item.orangTua?.namaAyah,
          namaIbu: item.orangTua?.namaIbu,
          noHpOrangTua: item.orangTua?.noHpOi,
          berkasCount: berkasUploaded,
        };
      })
    );

    return { success: true, data: formattedList };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal mengambil data pendaftaran PPDB';
    return { success: false, error: msg };
  }
}

export async function updatePendaftaranStatusAction(
  id: string,
  newStatus: 'Sudah Diverifikasi' | 'Belum Diverifikasi'
): Promise<ActionResult> {
  try {
    const targetStatus: StatusPendaftaran =
      newStatus === 'Sudah Diverifikasi' ? StatusPendaftaran.VERIFIED : StatusPendaftaran.SUBMITTED;

    await prisma.pendaftaran.update({
      where: { id },
      data: { status: targetStatus },
    });

    revalidatePath('/admin/data-ppdb');
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal memperbarui status pendaftaran';
    return { success: false, error: msg };
  }
}

export async function deletePendaftaranAction(id: string): Promise<ActionResult> {
  try {
    await prisma.pendaftaran.delete({
      where: { id },
    });

    revalidatePath('/admin/data-ppdb');
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal menghapus data pendaftaran';
    return { success: false, error: msg };
  }
}

export async function getPendaftaranDetailAction(id: string) {
  try {
    const item = await prisma.pendaftaran.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true } },
        biodata: true,
        sekolahAsal: true,
        orangTua: true,
        berkas: true,
        rekomendasi: true,
      },
    });

    if (!item) {
      return { success: false, error: 'Data pendaftaran tidak ditemukan' };
    }

    const isAllTabsComplete = Boolean(
      item.biodata && item.orangTua && item.sekolahAsal && item.rekomendasi && item.berkas
    );
    const isVerified =
      isAllTabsComplete ||
      item.status === StatusPendaftaran.VERIFIED ||
      item.status === StatusPendaftaran.ACCEPTED;

    return {
      success: true,
      data: {
        ...item,
        statusLabel: isVerified
          ? ('Sudah Diverifikasi' as const)
          : ('Belum Diverifikasi' as const),
        isAllTabsComplete,
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal mengambil detail pendaftaran';
    return { success: false, error: msg };
  }
}
