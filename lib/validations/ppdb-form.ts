import { z } from 'zod';

export const dataDiriSchema = z.object({
  namaLengkap: z.string().min(2, 'Nama lengkap minimal 2 karakter').max(100),
  email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
  tempatLahir: z.string().min(2, 'Tempat lahir wajib diisi').max(50),
  tanggalLahir: z.string().refine((val) => !val || !isNaN(Date.parse(val)), {
    message: 'Tanggal lahir tidak valid',
  }).optional().or(z.literal('')),
  nik: z.string().regex(/^\d{16}$/, 'NIK harus 16 digit angka').optional().or(z.literal('')),
  nisn: z.string().regex(/^\d{10}$/, 'NISN harus 10 digit angka').optional().or(z.literal('')),
  kewarganegaraan: z.string().default('Indonesia'),
  anakKe: z.string().regex(/^\d+$/, 'Harus berupa angka').optional().or(z.literal('')),
  jumlahSaudara: z.string().regex(/^\d+$/, 'Harus berupa angka').optional().or(z.literal('')),
  statusKeluarga: z.enum(['ANAK_KANDUNG', 'ANAK_TIRI', 'ANAK_ANGKAT']).default('ANAK_KANDUNG'),
  tinggalBersama: z.string().max(50).optional().or(z.literal('')),
  alamatLengkap: z.string().min(10, 'Alamat minimal 10 karakter').max(500),
  noHpWhatsapp: z.string().regex(/^(\+62|62|0)8[1-9][0-9]{6,9}$/, 'Format nomor WA tidak valid').optional().or(z.literal('')),
  mediaSosial: z.string().max(100).optional().or(z.literal('')),
  bahasaAsing: z.string().max(50).optional().or(z.literal('')),
  riwayatPrestasi: z.string().max(500).optional().or(z.literal('')),
  riwayatOrganisasi: z.string().max(500).optional().or(z.literal('')),
  beratBadan: z.string().regex(/^\d+(\.\d+)?$/, 'Harus berupa angka').optional().or(z.literal('')),
  tinggiBadan: z.string().regex(/^\d+(\.\d+)?$/, 'Harus berupa angka').optional().or(z.literal('')),
  riwayatPenyakit: z.string().max(300).optional().or(z.literal('')),
  isMerokok: z.boolean().default(false),
  isButaWarna: z.boolean().default(false),
  hasPenyakitMenular: z.boolean().default(false),
  pernyataanSiswa: z.boolean().default(false),
  fotoFormalUrl: z.string().url('URL foto tidak valid').optional().or(z.literal('')),
});

export const dataOrangTuaSchema = z.object({
  namaAyah: z.string().min(2, 'Nama ayah minimal 2 karakter').max(100).optional().or(z.literal('')),
  pekerjaanAyah: z.string().max(100).optional().or(z.literal('')),
  alamatDomisiliAyah: z.string().max(500).optional().or(z.literal('')),
  namaIbu: z.string().min(2, 'Nama ibu minimal 2 karakter').max(100).optional().or(z.literal('')),
  pekerjaanIbu: z.string().max(100).optional().or(z.literal('')),
  noHpOi: z.string().regex(/^(\+62|62|0)8[1-9][0-9]{6,9}$/, 'Format nomor HP tidak valid').optional().or(z.literal('')),
  keadaanOrangTua: z.enum(['LENGKAP', 'YATIM', 'PIATU', 'YATIM_PIATU']).default('LENGKAP'),
  penghasilanOrangTua: z.string().max(50).optional().or(z.literal('')),
  pernyataanOrangTua: z.boolean().default(false),
});

export const dataSekolahAsalSchema = z.object({
  namaSekolahAsal: z.string().min(3, 'Nama sekolah minimal 3 karakter').max(100).optional().or(z.literal('')),
  npsnSekolah: z.string().regex(/^\d{8}$/, 'NPSN harus 8 digit angka').optional().or(z.literal('')),
  statusSekolah: z.enum(['NEGERI', 'SWASTA']).default('NEGERI'),
  tahunLulus: z.string().regex(/^\d{4}$/, 'Tahun lulus harus 4 digit').optional().or(z.literal('')),
  alamatSekolah: z.string().max(500).optional().or(z.literal('')),
});

export const suratRekomendasiSchema = z.object({
  namaPemberiRekomendasi: z.string().min(2, 'Nama pemberi rekomendasi minimal 2 karakter').max(100),
  jabatanInstansi: z.string().max(100).optional().or(z.literal('')),
  noHpPemberiRekomendasi: z.string().regex(/^(\+62|62|0)8[1-9][0-9]{6,9}$/, 'Format nomor HP tidak valid').optional().or(z.literal('')),
  suratRekomendasiUrl: z.string().url('URL surat tidak valid').optional().or(z.literal('')),
  catatanRekomendasi: z.string().max(500).optional().or(z.literal('')),
});

export const berkasSchema = z.object({
  kkUrl: z.string().url('URL tidak valid').optional().or(z.literal('')),
  ktpOrangTuaUrl: z.string().url('URL tidak valid').optional().or(z.literal('')),
  kipUrl: z.string().url('URL tidak valid').optional().or(z.literal('')),
  akteUrl: z.string().url('URL tidak valid').optional().or(z.literal('')),
  ijazahUrl: z.string().url('URL tidak valid').optional().or(z.literal('')),
  raporUrl: z.string().url('URL tidak valid').optional().or(z.literal('')),
  prestasiUrl: z.string().url('URL tidak valid').optional().or(z.literal('')),
  tampakDepanRumahUrl: z.string().url('URL tidak valid').optional().or(z.literal('')),
  tampakSampingRumahUrl: z.string().url('URL tidak valid').optional().or(z.literal('')),
  kamarTidurUrl: z.string().url('URL tidak valid').optional().or(z.literal('')),
  ruangTamuUrl: z.string().url('URL tidak valid').optional().or(z.literal('')),
});

export const requiredFields = {
  dataDiri: ['namaLengkap', 'tempatLahir', 'alamatLengkap'],
  dataOrangTua: [],
  dataSekolahAsal: [],
  suratRekomendasi: ['namaPemberiRekomendasi'],
  berkas: [],
} as const;

export type DataDiriForm = z.infer<typeof dataDiriSchema>;
export type DataOrangTuaForm = z.infer<typeof dataOrangTuaSchema>;
export type DataSekolahAsalForm = z.infer<typeof dataSekolahAsalSchema>;
export type SuratRekomendasiForm = z.infer<typeof suratRekomendasiSchema>;
export type BerkasForm = z.infer<typeof berkasSchema>;

export type AllFormData = DataDiriForm & DataOrangTuaForm & DataSekolahAsalForm & SuratRekomendasiForm & BerkasForm;

export const tabSchemas = {
  'Data Diri': dataDiriSchema,
  'Data orang Tua': dataOrangTuaSchema,
  'Data sekolah Asal': dataSekolahAsalSchema,
  'Berkas': berkasSchema,
  'Surat Rekomendasi': suratRekomendasiSchema,
} as const;

export type TabName = keyof typeof tabSchemas;