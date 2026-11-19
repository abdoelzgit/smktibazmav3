import { StatusPendaftaran } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export async function getOrCreatePendaftaran(userId: string) {
  let pendaftaran = await prisma.pendaftaran.upsert({
    where: { userId },
    create: { userId, status: StatusPendaftaran.DRAFT },
    update: {},
  });

  if (pendaftaran.status === StatusPendaftaran.VERIFIED && !pendaftaran.nomorPendaftaran) {
    pendaftaran = await prisma.pendaftaran.update({
      where: { id: pendaftaran.id },
      data: { status: StatusPendaftaran.DRAFT },
    });
  }

  if (
    pendaftaran.status === StatusPendaftaran.SUBMITTED ||
    pendaftaran.status === StatusPendaftaran.VERIFIED ||
    pendaftaran.status === StatusPendaftaran.ACCEPTED
  ) {
    throw new Error('Pendaftaran sudah difinalisasi dan tidak dapat diubah.');
  }

  return pendaftaran;
}
