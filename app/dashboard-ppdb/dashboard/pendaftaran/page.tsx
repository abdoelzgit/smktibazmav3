import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';
import { PendaftaranPpdbClient } from '@/components/formulir-pendaftaran-client';

async function getInitialFormData() {
  const token = (await cookies()).get('auth_session')?.value;
  const secretKey = process.env.JWT_SECRET;

  if (!token || !secretKey) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secretKey));
    const userId = typeof payload.userId === 'string' ? payload.userId : '';

    if (!userId) return null;

    const pendaftaran = await prisma.pendaftaran.findUnique({
      where: { userId },
      include: {
        biodata: true,
        orangTua: true,
        sekolahAsal: true,
        rekomendasi: true,
        berkas: true,
      },
    });

    if (!pendaftaran) return null;

    const formData: Record<string, unknown> = {};

    if (pendaftaran.biodata) {
      Object.entries(pendaftaran.biodata).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData[key] = value instanceof Date ? value.toISOString().split('T')[0] : value;
        }
      });
    }

    if (pendaftaran.orangTua) {
      Object.entries(pendaftaran.orangTua).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData[key] = value;
        }
      });
    }

    if (pendaftaran.sekolahAsal) {
      Object.entries(pendaftaran.sekolahAsal).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData[key] = value;
        }
      });
    }

    if (pendaftaran.rekomendasi) {
      Object.entries(pendaftaran.rekomendasi).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData[key] = value;
        }
      });
    }

    if (pendaftaran.berkas) {
      Object.entries(pendaftaran.berkas).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData[key] = value;
        }
      });
    }

    return formData;
  } catch {
    return null;
  }
}

import { AllFormData } from '@/lib/validations/ppdb-form';

export default async function FormulirPendaftaran() {
  const initialData = await getInitialFormData();

  return (
    <main className="flex">
      <PendaftaranPpdbClient initialData={initialData as unknown as AllFormData | null} />
    </main>
  );
}