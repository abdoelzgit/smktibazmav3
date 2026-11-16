import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';
import { PendaftaranPpdbClient } from '@/components/formulir-pendaftaran-client';

async function getInitialFormData(): Promise<{ formData: Record<string, unknown> | null; isFinalized: boolean; savedTabs: Record<string, boolean> }> {
  const token = (await cookies()).get('auth_session')?.value;
  const secretKey = process.env.JWT_SECRET;

  if (!token || !secretKey) {
    return { formData: null, isFinalized: false, savedTabs: {} };
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secretKey));
    const userId = typeof payload.userId === 'string' ? payload.userId : '';

    if (!userId) return { formData: null, isFinalized: false, savedTabs: {} };

    const pendaftaran = await prisma.pendaftaran.findUnique({
      where: { userId },
      include: {
        biodata: true,
        orangTua: true,
        sekolahAsal: true,
        rekomendasi: true,
        berkas: true,
        riwayat: true,
      },
    });

    if (!pendaftaran) return { formData: null, isFinalized: false, savedTabs: {} };

    const formData: Record<string, unknown> = {};

    if (pendaftaran.biodata) {
      Object.entries(pendaftaran.biodata).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData[key] = value instanceof Date ? value.toISOString().split('T')[0] : value;
        }
      });
      formData.anakKe = pendaftaran.biodata.anakKe?.toString() ?? "";
      formData.jumlahSaudara = pendaftaran.biodata.jumlahSaudara?.toString() ?? "";
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

    const parseItems = (value: unknown, legacy: string | null | undefined, fields: string[], id: string) => {
      if (Array.isArray(value)) return value;
      if (typeof value === 'string') {
        try { const parsed = JSON.parse(value); if (Array.isArray(parsed)) return parsed; } catch { /* legacy text falls through */ }
      }
      return legacy ? [{ id, ...Object.fromEntries(fields.map((field, index) => [field, index === 0 ? legacy : ''])) }] : [];
    };
    formData.riwayatPrestasiItems = parseItems(pendaftaran.riwayat?.prestasiData, pendaftaran.biodata?.riwayatPrestasi, ['nama','tingkat','penyelenggara','tanggal','buktiUrl'], '00000000-0000-4000-8000-000000000001');
    formData.riwayatOrganisasiItems = parseItems(pendaftaran.riwayat?.organisasiData, pendaftaran.biodata?.riwayatOrganisasi, ['nama','jabatan','periode'], '00000000-0000-4000-8000-000000000002');
    formData.riwayatBahasaItems = parseItems(pendaftaran.riwayat?.bahasaData, pendaftaran.biodata?.bahasaAsing, ['nama','tingkat'], '00000000-0000-4000-8000-000000000003');

    return {
      formData,
      isFinalized: ['SUBMITTED', 'VERIFIED', 'ACCEPTED'].includes(pendaftaran.status),
      savedTabs: {
        'Data Diri': Boolean(pendaftaran.biodata),
        'Data orang Tua': Boolean(pendaftaran.orangTua),
        'Data sekolah Asal': Boolean(pendaftaran.sekolahAsal),
        'Berkas': Boolean(pendaftaran.berkas),
        'Surat Rekomendasi': Boolean(pendaftaran.rekomendasi),
        'Riwayat': Boolean(pendaftaran.riwayat),
      },
    };
  } catch {
    return { formData: null, isFinalized: false, savedTabs: {} };
  }
}

import { AllFormData } from '@/lib/validations/ppdb-form';

export default async function FormulirPendaftaran() {
  const { formData, isFinalized, savedTabs } = await getInitialFormData();

  return (
    <main className="flex">
      <PendaftaranPpdbClient initialData={formData as unknown as AllFormData | null} isFinalized={isFinalized} savedTabs={savedTabs} />
    </main>
  );
}
