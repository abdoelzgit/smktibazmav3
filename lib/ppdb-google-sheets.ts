import { google } from 'googleapis';
import type { JWTInput } from 'google-auth-library';
import path from 'node:path';
import { after } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

export const PPDB_SHEET_HEADERS = [
  'No. Pendaftaran', 'Status Pendaftaran', 'Tanggal Pendaftaran', 'Nama Akun Pengguna', 'Email Akun Pengguna',
  'Nama Lengkap Siswa', 'NISN', 'NIK Siswa', 'Email Siswa', 'No. WhatsApp Siswa', 'Tempat Lahir', 'Tanggal Lahir',
  'Kewarganegaraan', 'Anak Ke', 'Jumlah Saudara', 'Status Keluarga', 'Tinggal Bersama', 'Alamat Lengkap', 'Media Sosial',
  'Link Pengumpulan Video', 'Konfirmasi Membaca Panduan Video', 'Riwayat Bahasa (JSON)', 'Riwayat Prestasi (JSON)',
  'Riwayat Organisasi (JSON)', 'Berat Badan (kg)', 'Tinggi Badan (cm)', 'Riwayat Penyakit', 'Status Merokok',
  'Status Buta Warna', 'Penyakit Menular', 'Pernyataan Siswa', 'Keadaan Orang Tua', 'Nama Ayah', 'Pekerjaan Ayah',
  'Alamat Domisili Ayah', 'Nama Ibu', 'Pekerjaan Ibu', 'No. HP/WA Orang Tua', 'Penghasilan Orang Tua',
  'Pernyataan Orang Tua', 'Nama Sekolah Asal', 'NPSN Sekolah', 'Status Sekolah', 'Tahun Lulus', 'Alamat Sekolah Asal',
  'Nama Pemberi Rekomendasi', 'Jabatan/Instansi Rekomendasi', 'No. HP Pemberi Rekomendasi', 'Catatan Rekomendasi',
  'URL Surat Rekomendasi', 'URL KK', 'URL KTP Orang Tua/Wali', 'URL KIP/KIS/KPS/PHK', 'URL Akta Kelahiran',
  'URL Ijazah/SKL', 'URL Rapor', 'URL Piagam Prestasi', 'URL BPJS', 'URL SKTM', 'URL Surat Pernyataan CPDB',
  'URL Surat Pernyataan Tidak Merokok', 'URL Foto Tampak Depan Rumah', 'URL Foto Tampak Samping Rumah',
  'URL Foto Kamar Tidur', 'URL Foto Kamar Mandi', 'URL Foto Ruang Tamu',
];

const SHEET_RANGE_END_COLUMN = 'BN';
const LOCK_TIMEOUT_MS = 5 * 60 * 1000;
const BATCH_SIZE = 40;

type RegistrationWithRelations = NonNullable<Awaited<ReturnType<typeof getRegistration>>>;

async function getRegistration(id: string) {
  return prisma.pendaftaran.findUnique({
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
}

function displayValue(value: unknown, fallback = '-'): string {
  if (value === null || value === undefined || value === '') return fallback;
  if (value instanceof Date) {
    return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(value);
  }
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value).replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim() || fallback;
}

function displayPhone(value: string | null | undefined): string {
  if (!value) return '-';
  const raw = value.trim();
  const digits = raw.replace(/[^\d]/g, '');
  if (!digits) return displayValue(raw);
  if (/^\+?\d[\d\s\-()]*$/.test(raw)) {
    if (digits.startsWith('62')) return `0${digits.slice(2)}`;
    return digits.startsWith('0') ? digits : `0${digits}`;
  }
  return displayValue(raw);
}

function mapRegistrationToRow(registration: RegistrationWithRelations): string[] {
  const { biodata, orangTua, sekolahAsal, recomendacao, berkas, riwayat } = {
    ...registration,
    recomendacao: registration.rekomendasi,
  };
  const verified = Boolean(registration.nomorPendaftaran)
    && ['VERIFIED', 'ACCEPTED'].includes(registration.status);
  const historyItems = (value: unknown) => Array.isArray(value) && value.length ? JSON.stringify(value) : 'Tidak Ada';
  const statusFamily: Record<string, string> = {
    ANAK_KANDUNG: 'Anak Kandung', ANAK_TIRI: 'Anak Tiri', ANAK_ANGKAT: 'Anak Angkat',
  };
  const parentState: Record<string, string> = {
    LENGKAP: 'Lengkap (Ayah & Ibu)', YATIM: 'Yatim (Ayah Meninggal)',
    PIATU: 'Piatu (Ibu Meninggal)', YATIM_PIATU: 'Yatim Piatu',
  };
  const schoolState: Record<string, string> = { NEGERI: 'Negeri', SWASTA: 'Swasta' };
  const childOrder = displayValue(biodata?.anakKe);
  const siblingCount = displayValue(biodata?.jumlahSaudara);

  return [
    registration.nomorPendaftaran || registration.id.slice(-6).toUpperCase(),
    verified ? 'Sudah Diverifikasi' : 'Belum Diverifikasi',
    displayValue(registration.createdAt), displayValue(registration.user.name), displayValue(registration.user.email),
    displayValue(biodata?.namaLengkap, registration.user.name || 'Pendaftar Baru'), displayValue(biodata?.nisn),
    displayValue(biodata?.nik), displayValue(biodata?.email, registration.user.email || '-'),
    displayPhone(biodata?.noHpWhatsapp || orangTua?.noHpOi), displayValue(biodata?.tempatLahir),
    displayValue(biodata?.tanggalLahir), displayValue(biodata?.kewarganegaraan, 'Indonesia'), childOrder, siblingCount,
    displayValue(biodata?.statusKeluarga ? statusFamily[biodata.statusKeluarga] || biodata.statusKeluarga.replace(/_/g, ' ') : null),
    displayValue(biodata?.tinggalBersama), displayValue(biodata?.alamatLengkap), displayValue(biodata?.mediaSosial, 'Tidak Ada'),
    displayValue(biodata?.linkPengumpulanVideo), biodata?.setujuPanduanVideo ? 'Sudah membaca' : 'Belum dikonfirmasi',
    historyItems(riwayat?.bahasaData), historyItems(riwayat?.prestasiData), historyItems(riwayat?.organisasiData),
    displayValue(biodata?.beratBadan), displayValue(biodata?.tinggiBadan), displayValue(biodata?.riwayatPenyakit, 'Tidak Ada'),
    biodata?.isMerokok ? 'Merokok' : 'Tidak Merokok', biodata?.isButaWarna ? 'Buta Warna' : 'Tidak Buta Warna',
    biodata?.hasPenyakitMenular ? 'Ada Riwayat' : 'Tidak Ada', biodata?.pernyataanSiswa ? 'Sudah Menyetujui' : 'Belum Menyetujui',
    displayValue(orangTua?.keadaanOrangTua ? parentState[orangTua.keadaanOrangTua] || orangTua.keadaanOrangTua.replace(/_/g, ' ') : null),
    displayValue(orangTua?.namaAyah), displayValue(orangTua?.pekerjaanAyah), displayValue(orangTua?.alamatDomisiliAyah),
    displayValue(orangTua?.namaIbu), displayValue(orangTua?.pekerjaanIbu), displayPhone(orangTua?.noHpOi),
    displayValue(orangTua?.penghasilanOrangTua), orangTua?.pernyataanOrangTua ? 'Sudah Menyetujui' : 'Belum Menyetujui',
    displayValue(sekolahAsal?.namaSekolahAsal), displayValue(sekolahAsal?.npsnSekolah),
    displayValue(sekolahAsal?.statusSekolah ? schoolState[sekolahAsal.statusSekolah] || sekolahAsal.statusSekolah : null),
    displayValue(sekolahAsal?.tahunLulus), displayValue(sekolahAsal?.alamatSekolah),
    displayValue(recomendacao?.namaPemberiRekomendasi), displayValue(recomendacao?.jabatanInstansi),
    displayPhone(recomendacao?.noHpPemberiRekomendasi), displayValue(recomendacao?.catatanRekomendasi, 'Tidak Ada'),
    displayValue(recomendacao?.suratRekomendasiUrl), displayValue(berkas?.kkUrl), displayValue(berkas?.ktpOrangTuaUrl),
    displayValue(berkas?.kipUrl), displayValue(berkas?.akteUrl), displayValue(berkas?.ijazahUrl), displayValue(berkas?.raporUrl),
    displayValue(berkas?.prestasiUrl), displayValue(berkas?.bpjsUrl), displayValue(berkas?.sktmUrl),
    displayValue(berkas?.suratPernyataanCpdbUrl), displayValue(berkas?.suratTidakMerokokUrl),
    displayValue(berkas?.tampakDepanRumahUrl), displayValue(berkas?.tampakSampingRumahUrl),
    displayValue(berkas?.kamarTidurUrl), displayValue(berkas?.kamarMandiUrl), displayValue(berkas?.ruangTamuUrl),
  ];
}

function getSheetsClient() {
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  let auth: InstanceType<typeof google.auth.GoogleAuth>;
  if (serviceAccountJson) {
    const parsedJson: unknown = JSON.parse(serviceAccountJson);
    const parsedCredentials = z.object({
      type: z.literal('service_account'),
      client_email: z.string().email(),
      private_key: z.string().min(1),
    }).passthrough().safeParse(parsedJson);
    if (!parsedCredentials.success) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON tidak valid.');
    auth = new google.auth.GoogleAuth({
      credentials: parsedCredentials.data as JWTInput,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
  } else {
    auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(process.cwd(), 'credential.json'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
  }
  return google.sheets({ version: 'v4', auth });
}

export function getPpdbSheetKey(id: string, nomorPendaftaran?: string | null): string {
  return nomorPendaftaran || id.slice(-6).toUpperCase();
}

export async function enqueuePpdbSheetSync(
  pendaftaranId: string,
  operation: 'UPSERT' | 'DELETE' = 'UPSERT',
  sheetKey?: string,
) {
  const registration = sheetKey ? null : await prisma.pendaftaran.findUnique({
    where: { id: pendaftaranId }, select: { nomorPendaftaran: true },
  });
  const key = sheetKey ?? getPpdbSheetKey(pendaftaranId, registration?.nomorPendaftaran);
  await prisma.ppdbSheetSyncQueue.upsert({
    where: { pendaftaranId },
    create: { pendaftaranId, operation, sheetKey: key },
    update: { operation, sheetKey: key, attempts: 0, availableAt: new Date(), lockedAt: null, lastError: null },
  });
}

export async function schedulePpdbSheetSync(
  pendaftaranId: string,
  operation: 'UPSERT' | 'DELETE' = 'UPSERT',
  sheetKey?: string,
) {
  try {
    await enqueuePpdbSheetSync(pendaftaranId, operation, sheetKey);
  } catch (error) {
    console.error('Gagal memasukkan sinkronisasi Sheets ke antrean:', error);
    return;
  }

  after(async () => {
    try {
      await processPpdbSheetSyncQueue();
    } catch (error) {
      console.error('Sinkronisasi Google Sheets tertunda dan akan dicoba ulang:', error);
    }
  });
}

export async function processPpdbSheetSyncQueue() {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  if (!spreadsheetId) throw new Error('GOOGLE_SHEETS_SPREADSHEET_ID belum diatur.');

  const sheets = getSheetsClient();
  const sheetTitle = process.env.GOOGLE_SHEETS_TAB_NAME || 'Rekap Peserta';
  let metadata = await sheets.spreadsheets.get({ spreadsheetId, fields: 'sheets.properties' });
  let targetSheet = metadata.data.sheets?.find((sheet) => sheet.properties?.title === sheetTitle);
  if (!targetSheet) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: [{ addSheet: { properties: { title: sheetTitle } } }] },
    });
    metadata = await sheets.spreadsheets.get({ spreadsheetId, fields: 'sheets.properties' });
    targetSheet = metadata.data.sheets?.find((sheet) => sheet.properties?.title === sheetTitle);
  }
  if (!targetSheet?.properties?.sheetId && targetSheet?.properties?.sheetId !== 0) {
    throw new Error('Tab rekap Google Sheets tidak dapat disiapkan.');
  }

  const grid = targetSheet.properties?.gridProperties;
  if ((grid?.columnCount ?? 0) < PPDB_SHEET_HEADERS.length) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{
          updateSheetProperties: {
            properties: {
              sheetId: targetSheet.properties.sheetId,
              gridProperties: { columnCount: PPDB_SHEET_HEADERS.length },
            },
            fields: 'gridProperties.columnCount',
          },
        }],
      },
    });
  }

  const quotedTitle = `'${sheetTitle.replace(/'/g, "''")}'`;
  const headerResult = await sheets.spreadsheets.values.get({ spreadsheetId, range: `${quotedTitle}!A1:BN1` });
  if (!headerResult.data.values?.length) {
    await sheets.spreadsheets.values.update({
      spreadsheetId, range: `${quotedTitle}!A1`, valueInputOption: 'RAW', requestBody: { values: [PPDB_SHEET_HEADERS] },
    });
  }

  const now = new Date();
  const expiredLock = new Date(now.getTime() - LOCK_TIMEOUT_MS);
  const candidates = await prisma.ppdbSheetSyncQueue.findMany({
    where: {
      availableAt: { lte: now },
      OR: [{ lockedAt: null }, { lockedAt: { lt: expiredLock } }],
    },
    orderBy: { createdAt: 'asc' },
    take: BATCH_SIZE,
  });
  const claimed = [];
  for (const candidate of candidates) {
    const lock = await prisma.ppdbSheetSyncQueue.updateMany({
      where: {
        pendaftaranId: candidate.pendaftaranId,
        availableAt: { lte: now },
        OR: [{ lockedAt: null }, { lockedAt: { lt: expiredLock } }],
      },
      data: { lockedAt: now },
    });
    if (lock.count) {
      const item = await prisma.ppdbSheetSyncQueue.findUnique({ where: { pendaftaranId: candidate.pendaftaranId } });
      if (item) claimed.push(item);
    }
  }
  if (!claimed.length) return { processed: 0, failed: 0 };

  try {
  const sheetRows = (await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${quotedTitle}!A:A`,
  })).data.values ?? [];
  const rowByKey = new Map<string, number>();
  sheetRows.forEach((row, index) => {
    if (index > 0 && typeof row[0] === 'string' && row[0]) rowByKey.set(row[0], index + 1);
  });

  const updates: { range: string; values: string[][] }[] = [];
  const appends: string[][] = [];
  const deletions: { id: string; row: number }[] = [];
  const successfulQueueIds: string[] = [];
  let failed = 0;

  const registrations = await prisma.pendaftaran.findMany({
    where: { id: { in: claimed.filter((item) => item.operation === 'UPSERT').map((item) => item.pendaftaranId) } },
    include: {
      user: { select: { name: true, email: true } }, biodata: true, sekolahAsal: true,
      orangTua: true, berkas: true, rekomendasi: true, riwayat: true,
    },
  });
  const registrationsById = new Map(registrations.map((registration) => [registration.id, registration]));

  for (const item of claimed) {
    try {
      if (item.operation === 'DELETE' || !registrationsById.has(item.pendaftaranId)) {
        const row = rowByKey.get(item.sheetKey);
        if (row) deletions.push({ id: item.pendaftaranId, row });
        else successfulQueueIds.push(item.pendaftaranId);
        continue;
      }
      const registration = registrationsById.get(item.pendaftaranId)!;
      const rowValues = mapRegistrationToRow(registration);
      const sheetRow = rowByKey.get(item.sheetKey)
        ?? rowByKey.get(registration.id.slice(-6).toUpperCase());
      if (sheetRow) updates.push({ range: `${quotedTitle}!A${sheetRow}:BN${sheetRow}`, values: [rowValues] });
      else appends.push(rowValues);
      successfulQueueIds.push(item.pendaftaranId);
    } catch (error) {
      failed += 1;
      await scheduleRetry(item.pendaftaranId, item.attempts, error);
    }
  }

  if (deletions.length) {
    const rowsToClear = deletions.map(({ row }) => `${quotedTitle}!A${row}:BN${row}`);
    await Promise.all(rowsToClear.map((range) => sheets.spreadsheets.values.clear({ spreadsheetId, range })));
    successfulQueueIds.push(...deletions.map(({ id }) => id));
  }
  if (updates.length) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId, requestBody: { valueInputOption: 'RAW', data: updates },
    });
  }
  if (appends.length) {
    await sheets.spreadsheets.values.append({
      spreadsheetId, range: `${quotedTitle}!A:BN`, valueInputOption: 'RAW', insertDataOption: 'INSERT_ROWS',
      requestBody: { values: appends },
    });
  }

  for (const id of successfulQueueIds) {
    await prisma.ppdbSheetSyncQueue.deleteMany({ where: { pendaftaranId: id, lockedAt: now } });
  }
  return { processed: successfulQueueIds.length, failed };
  } catch (error) {
    await Promise.all(claimed.map((item) => scheduleRetry(item.pendaftaranId, item.attempts, error)));
    return { processed: 0, failed: claimed.length };
  }
}

async function scheduleRetry(id: string, attempts: number, error: unknown) {
  const nextAttempts = attempts + 1;
  const delayMinutes = Math.min(60, 2 ** Math.min(nextAttempts, 6));
  const message = error instanceof Error ? error.message : 'Sinkronisasi Google Sheets gagal.';
  await prisma.ppdbSheetSyncQueue.updateMany({
    where: { pendaftaranId: id },
    data: {
      attempts: nextAttempts,
      availableAt: new Date(Date.now() + delayMinutes * 60_000),
      lockedAt: null,
      lastError: message.slice(0, 1000),
    },
  });
}

