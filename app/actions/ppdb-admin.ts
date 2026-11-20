'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { StatusPendaftaran } from '@prisma/client';
import { Peserta } from '@/components/types';
import { cookies } from 'next/headers';
import { verifyToken } from '@/app/actions/auth';
import { google } from 'googleapis';
import path from 'node:path';
import { z } from 'zod';
import { getPpdbSheetKey, schedulePpdbSheetSync } from '@/lib/ppdb-google-sheets';

const AUTH_COOKIE_NAME = 'auth_session';
const LOCKED_STATUSES: StatusPendaftaran[] = [
  StatusPendaftaran.SUBMITTED,
  StatusPendaftaran.VERIFIED,
  StatusPendaftaran.ACCEPTED,
];

export type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type PesertaAdminData = Peserta & {
  rawStatus: StatusPendaftaran;
};

const googleSheetsSyncSchema = z.object({
  headers: z.array(z.string().trim().min(1).max(100)).min(1).max(100),
  rows: z.array(z.array(z.string().max(50000)).max(100)).max(10000),
});

function getGoogleSheetsUrl(spreadsheetId: string) {
  return `https://docs.google.com/spreadsheets/d/${encodeURIComponent(spreadsheetId)}/edit`;
}

export async function getPpdbGoogleSheetsUrlAction(): Promise<ActionResult<{ url: string }>> {
  try {
    const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
    const session = token ? await verifyToken(token) : null;
    if (session?.role !== 'ADMIN') {
      return { success: false, error: 'Hanya admin yang dapat membuka rekap SPMB.' };
    }

    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    if (!spreadsheetId) {
      return { success: false, error: 'Spreadsheet rekap belum dikonfigurasi.' };
    }

    return { success: true, data: { url: getGoogleSheetsUrl(spreadsheetId) } };
  } catch (error) {
    console.error('Gagal menyiapkan tautan Google Sheets:', error);
    return { success: false, error: 'Gagal menyiapkan tautan Google Sheets.' };
  }
}

export async function syncPendaftaranToGoogleSheetsAction(
  input: { headers: string[]; rows: string[][] }
): Promise<ActionResult<{ url: string; rowCount: number }>> {
  try {
    const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
    const session = token ? await verifyToken(token) : null;
    if (session?.role !== 'ADMIN') {
      return { success: false, error: 'Hanya admin yang dapat menyinkronkan rekap SPMB.' };
    }

    const parsedInput = googleSheetsSyncSchema.safeParse(input);
    if (!parsedInput.success) {
      return { success: false, error: 'Format data rekap tidak valid.' };
    }

    const { headers, rows } = parsedInput.data;
    if (rows.some((row) => row.length !== headers.length)) {
      return { success: false, error: 'Jumlah kolom rekap tidak konsisten.' };
    }

    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    if (!spreadsheetId) {
      return { success: false, error: 'Konfigurasi GOOGLE_SHEETS_SPREADSHEET_ID belum diatur.' };
    }

    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(process.cwd(), 'credential.json'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });
    const sheetTitle = process.env.GOOGLE_SHEETS_TAB_NAME || 'Rekap Peserta';
    let metadata = await sheets.spreadsheets.get({
      spreadsheetId,
      fields: 'sheets.properties',
    });
    let targetSheet = metadata.data.sheets?.find((sheet) => sheet.properties?.title === sheetTitle);

    if (!targetSheet) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: { requests: [{ addSheet: { properties: { title: sheetTitle } } }] },
      });
      metadata = await sheets.spreadsheets.get({
        spreadsheetId,
        fields: 'sheets.properties',
      });
      targetSheet = metadata.data.sheets?.find((sheet) => sheet.properties?.title === sheetTitle);
    }

    const targetSheetProperties = targetSheet?.properties;
    const sheetId = targetSheetProperties?.sheetId;
    if (sheetId === undefined || !targetSheetProperties) {
      return { success: false, error: 'Tab rekap Google Sheets tidak dapat disiapkan.' };
    }

    const requiredRows = rows.length + 1;
    const requiredColumns = headers.length;
    const currentGrid = targetSheetProperties.gridProperties;
    if ((currentGrid?.rowCount ?? 0) < requiredRows || (currentGrid?.columnCount ?? 0) < requiredColumns) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [{
            updateSheetProperties: {
              properties: {
                sheetId,
                gridProperties: {
                  rowCount: Math.max(currentGrid?.rowCount ?? 0, requiredRows),
                  columnCount: Math.max(currentGrid?.columnCount ?? 0, requiredColumns),
                },
              },
              fields: 'gridProperties.rowCount,gridProperties.columnCount',
            },
          }],
        },
      });
    }

    const quotedSheetTitle = `'${sheetTitle.replace(/'/g, "''")}'`;
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: `${quotedSheetTitle}!A:ZZ`,
    });
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${quotedSheetTitle}!A1`,
      valueInputOption: 'RAW',
      requestBody: { values: [headers, ...rows] },
    });

    return {
      success: true,
      data: {
        url: getGoogleSheetsUrl(spreadsheetId),
        rowCount: rows.length,
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal menyinkronkan rekap ke Google Sheets.';
    return { success: false, error: msg };
  }
}

export async function unlockPendaftaranAction(id: string): Promise<ActionResult> {
  try {
    const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
    const session = token ? await verifyToken(token) : null;
    if (session?.role !== 'ADMIN') {
      return { success: false, error: 'Hanya admin yang dapat membuka kunci formulir.' };
    }

    const pendaftaran = await prisma.pendaftaran.findUnique({
      where: { id },
      select: { id: true, status: true, nomorPendaftaran: true },
    });
    if (!pendaftaran) return { success: false, error: 'Data pendaftaran tidak ditemukan.' };
    if (!pendaftaran.nomorPendaftaran || !LOCKED_STATUSES.includes(pendaftaran.status)) {
      return { success: false, error: 'Formulir ini tidak sedang terkunci.' };
    }

    await prisma.pendaftaran.update({
      where: { id },
      data: { status: StatusPendaftaran.DRAFT },
    });

    await schedulePpdbSheetSync(id);

    revalidatePath('/admin/data-ppdb');
    revalidatePath(`/admin/data-ppdb/${id}`);
    revalidatePath('/spmb/form');
    revalidatePath('/spmb/dashboard');
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal membuka kunci formulir';
    return { success: false, error: msg };
  }
}

function parseJsonRecords(value: unknown): Array<Record<string, unknown>> {
  let records = value;
  if (typeof records === 'string') {
    try {
      records = JSON.parse(records);
    } catch {
      return [];
    }
  }

  if (!Array.isArray(records)) return [];
  return records.filter((record): record is Record<string, unknown> =>
    typeof record === 'object' && record !== null && !Array.isArray(record)
  );
}

function hasRequiredValues(...values: unknown[]): boolean {
  return values.every((value) =>
    typeof value === 'boolean'
    || (typeof value === 'number' && Number.isFinite(value))
    || (typeof value === 'string' && value.trim().length > 0)
    || (value instanceof Date && !Number.isNaN(value.getTime()))
  );
}

function historyIsComplete(records: Array<Record<string, unknown>>, requiredFields: string[]): boolean {
  return records.every((record) => requiredFields.every((field) =>
    typeof record[field] === 'string' && (record[field] as string).trim().length > 0
  ));
}

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
        riwayat: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedList: PesertaAdminData[] = await Promise.all(
      list.map(async (item) => {
        const isVerified = Boolean(item.nomorPendaftaran)
          && (item.status === StatusPendaftaran.VERIFIED || item.status === StatusPendaftaran.ACCEPTED);
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
          rawStatus: item.status,
          fotoFormalUrl: item.biodata?.fotoFormalUrl,
          namaAyah: item.orangTua?.namaAyah,
          namaIbu: item.orangTua?.namaIbu,
          noHpOrangTua: item.orangTua?.noHpOi,
          berkasCount: berkasUploaded,

          // Akun User
          namaAkun: item.user.name,
          emailAkun: item.user.email,

          // Biodata Siswa Lengkap
          tempatLahir: item.biodata?.tempatLahir,
          tanggalLahir: item.biodata?.tanggalLahir
            ? item.biodata.tanggalLahir.toISOString().split('T')[0]
            : null,
          kewarganegaraan: item.biodata?.kewarganegaraan || 'Indonesia',
          anakKe: item.biodata?.anakKe,
          jumlahSaudara: item.biodata?.jumlahSaudara,
          statusKeluarga: item.biodata?.statusKeluarga,
          tinggalBersama: item.biodata?.tinggalBersama,
          mediaSosial: item.biodata?.mediaSosial,
          linkPengumpulanVideo: item.biodata?.linkPengumpulanVideo,
          setujuPanduanVideo: item.biodata?.setujuPanduanVideo,
          bahasaAsing: item.biodata?.bahasaAsing,
          riwayatPrestasi: item.biodata?.riwayatPrestasi,
          riwayatOrganisasi: item.biodata?.riwayatOrganisasi,
          beratBadan: item.biodata?.beratBadan,
          tinggiBadan: item.biodata?.tinggiBadan,
          riwayatPenyakit: item.biodata?.riwayatPenyakit,
          isMerokok: item.biodata?.isMerokok,
          isButaWarna: item.biodata?.isButaWarna,
          hasPenyakitMenular: item.biodata?.hasPenyakitMenular,
          pernyataanSiswa: item.biodata?.pernyataanSiswa,
          riwayatPrestasiItems: parseJsonRecords(item.riwayat?.prestasiData),
          riwayatOrganisasiItems: parseJsonRecords(item.riwayat?.organisasiData),
          riwayatBahasaItems: parseJsonRecords(item.riwayat?.bahasaData),

          // Data Orang Tua Lengkap
          keadaanOrangTua: item.orangTua?.keadaanOrangTua,
          pekerjaanAyah: item.orangTua?.pekerjaanAyah,
          alamatDomisiliAyah: item.orangTua?.alamatDomisiliAyah,
          pekerjaanIbu: item.orangTua?.pekerjaanIbu,
          penghasilanOrangTua: item.orangTua?.penghasilanOrangTua,
          pernyataanOrangTua: item.orangTua?.pernyataanOrangTua,

          // Data Sekolah Asal Lengkap
          statusSekolah: item.sekolahAsal?.statusSekolah,
          tahunLulus: item.sekolahAsal?.tahunLulus,
          alamatSekolah: item.sekolahAsal?.alamatSekolah,

          // Surat Rekomendasi Lengkap
          namaPemberiRekomendasi: item.rekomendasi?.namaPemberiRekomendasi,
          jabatanInstansi: item.rekomendasi?.jabatanInstansi,
          noHpPemberiRekomendasi: item.rekomendasi?.noHpPemberiRekomendasi,
          catatanRekomendasi: item.rekomendasi?.catatanRekomendasi,
          suratRekomendasiUrl: item.rekomendasi?.suratRekomendasiUrl,

          // Berkas Lampiran Lengkap
          kkUrl: item.berkas?.kkUrl,
          ktpOrangTuaUrl: item.berkas?.ktpOrangTuaUrl,
          kipUrl: item.berkas?.kipUrl,
          akteUrl: item.berkas?.akteUrl,
          ijazahUrl: item.berkas?.ijazahUrl,
          raporUrl: item.berkas?.raporUrl,
          prestasiUrl: item.berkas?.prestasiUrl,
          bpjsUrl: item.berkas?.bpjsUrl,
          sktmUrl: item.berkas?.sktmUrl,
          suratPernyataanCpdbUrl: item.berkas?.suratPernyataanCpdbUrl,
          suratTidakMerokokUrl: item.berkas?.suratTidakMerokokUrl,
          tampakDepanRumahUrl: item.berkas?.tampakDepanRumahUrl,
          tampakSampingRumahUrl: item.berkas?.tampakSampingRumahUrl,
          kamarTidurUrl: item.berkas?.kamarTidurUrl,
          kamarMandiUrl: item.berkas?.kamarMandiUrl,
          ruangTamuUrl: item.berkas?.ruangTamuUrl,
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

    await schedulePpdbSheetSync(id);

    revalidatePath('/admin/data-ppdb');
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal memperbarui status pendaftaran';
    return { success: false, error: msg };
  }
}

export async function deletePendaftaranAction(id: string): Promise<ActionResult> {
  try {
    const pendaftaran = await prisma.pendaftaran.findUnique({
      where: { id },
      select: { id: true, nomorPendaftaran: true },
    });
    if (!pendaftaran) return { success: false, error: 'Data pendaftaran tidak ditemukan.' };

    await prisma.pendaftaran.delete({
      where: { id },
    });

    await schedulePpdbSheetSync(id, 'DELETE', getPpdbSheetKey(id, pendaftaran.nomorPendaftaran));

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
        riwayat: true,
      },
    });

    if (!item) {
      return { success: false, error: 'Data pendaftaran tidak ditemukan' };
    }

    const prestasiItems = parseJsonRecords(item.riwayat?.prestasiData);
    const organisasiItems = parseJsonRecords(item.riwayat?.organisasiData);
    const bahasaItems = parseJsonRecords(item.riwayat?.bahasaData);
    const tabCompletion = {
      biodata: Boolean(item.biodata && hasRequiredValues(
        item.biodata.namaLengkap, item.biodata.email, item.biodata.tempatLahir, item.biodata.tanggalLahir,
        item.biodata.nik, item.biodata.nisn, item.biodata.kewarganegaraan, item.biodata.anakKe,
        item.biodata.jumlahSaudara, item.biodata.statusKeluarga, item.biodata.tinggalBersama,
        item.biodata.alamatLengkap, item.biodata.noHpWhatsapp, item.biodata.mediaSosial,
        item.biodata.linkPengumpulanVideo, item.biodata.beratBadan, item.biodata.tinggiBadan,
        item.biodata.riwayatPenyakit, item.biodata.isMerokok, item.biodata.isButaWarna,
        item.biodata.hasPenyakitMenular, item.biodata.pernyataanSiswa, item.biodata.fotoFormalUrl
      )),
      riwayat: Boolean(item.riwayat
        && historyIsComplete(prestasiItems, ['nama', 'tingkat', 'tanggal', 'buktiUrl'])
        && historyIsComplete(organisasiItems, ['nama', 'jabatan', 'periode'])
        && historyIsComplete(bahasaItems, ['nama', 'tingkat'])),
      orangTua: Boolean(item.orangTua && hasRequiredValues(
        item.orangTua.namaAyah, item.orangTua.pekerjaanAyah, item.orangTua.namaIbu,
        item.orangTua.pekerjaanIbu, item.orangTua.noHpOi, item.orangTua.keadaanOrangTua,
        item.orangTua.penghasilanOrangTua, item.orangTua.alamatDomisiliAyah, item.orangTua.pernyataanOrangTua
      )),
      sekolah: Boolean(item.sekolahAsal && hasRequiredValues(
        item.sekolahAsal.namaSekolahAsal, item.sekolahAsal.npsnSekolah, item.sekolahAsal.statusSekolah,
        item.sekolahAsal.tahunLulus, item.sekolahAsal.alamatSekolah
      )),
      berkas: Boolean(item.berkas && hasRequiredValues(
        item.berkas.kkUrl, item.berkas.ktpOrangTuaUrl, item.berkas.kipUrl, item.berkas.akteUrl,
        item.berkas.ijazahUrl, item.berkas.raporUrl, item.berkas.sktmUrl,
        item.berkas.suratPernyataanCpdbUrl,
        item.berkas.suratTidakMerokokUrl, item.berkas.tampakDepanRumahUrl,
        item.berkas.tampakSampingRumahUrl, item.berkas.kamarTidurUrl,
        item.berkas.kamarMandiUrl, item.berkas.ruangTamuUrl
      )),
      rekomendasi: Boolean(item.rekomendasi && hasRequiredValues(
        item.rekomendasi.namaPemberiRekomendasi, item.rekomendasi.jabatanInstansi,
        item.rekomendasi.noHpPemberiRekomendasi, item.rekomendasi.suratRekomendasiUrl,
        item.rekomendasi.catatanRekomendasi
      )),
    };
    const isAllTabsComplete = Object.values(tabCompletion).every(Boolean);
    const isVerified = Boolean(item.nomorPendaftaran)
      && (item.status === StatusPendaftaran.VERIFIED || item.status === StatusPendaftaran.ACCEPTED);

    return {
      success: true,
      data: {
        ...item,
        statusLabel: isVerified
          ? ('Sudah Diverifikasi' as const)
          : ('Belum Diverifikasi' as const),
        isAllTabsComplete,
        tabCompletion,
        riwayatPrestasiItems: prestasiItems,
        riwayatOrganisasiItems: organisasiItems,
        riwayatBahasaItems: bahasaItems,
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal mengambil detail pendaftaran';
    return { success: false, error: msg };
  }
}
