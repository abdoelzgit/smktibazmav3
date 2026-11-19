const DEFAULT_UPLOAD_MAX_BYTES = 5 * 1024 * 1024;
const configuredUploadMaxBytes = Number(process.env.UPLOAD_MAX_BYTES);

export const UPLOAD_MAX_BYTES =
  Number.isFinite(configuredUploadMaxBytes) && configuredUploadMaxBytes > 0
    ? configuredUploadMaxBytes
    : DEFAULT_UPLOAD_MAX_BYTES;

export const ALLOWED_MIME = [
  "image/webp",
  "image/jpeg",
  "image/png",
  "application/pdf",
] as const;

export const BERKAS_FIELDS = {
  kkUrl: "kk",
  ktpOrangTuaUrl: "ktp-orang-tua",
  kipUrl: "kip",
  akteUrl: "akte",
  ijazahUrl: "ijazah",
  raporUrl: "rapor",
  prestasiUrl: "prestasi",
  bpjsUrl: "bpjs",
  sktmUrl: "sktm",
  suratPernyataanCpdbUrl: "pernyataan-cpdb",
  suratTidakMerokokUrl: "pernyataan-tidak-merokok",
  tampakDepanRumahUrl: "rumah-depan",
  tampakSampingRumahUrl: "rumah-samping",
  kamarTidurUrl: "kamar-tidur",
  kamarMandiUrl: "kamar-mandi",
  ruangTamuUrl: "ruang-tamu",
} as const;

export type BerkasKey = keyof typeof BERKAS_FIELDS;
