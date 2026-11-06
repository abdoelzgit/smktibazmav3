export type StatusPeserta = "Belum Diverifikasi" | "Sudah Diverifikasi";

export interface Peserta {
  id: string;
  nomorPendaftaran?: string;
  nisn: string;
  nama: string;
  email?: string;
  noHp?: string;
  alamat: string;
  nik: string;
  sekolahAsal?: string;
  npsnSekolah?: string;
  tanggalDaftar?: string;
  status: StatusPeserta;
  rawStatus?: string;
  fotoFormalUrl?: string | null;
  namaAyah?: string | null;
  namaIbu?: string | null;
  noHpOrangTua?: string | null;
  berkasCount?: number;

  // Akun User
  namaAkun?: string | null;
  emailAkun?: string | null;

  // Biodata Siswa Lengkap
  tempatLahir?: string | null;
  tanggalLahir?: string | null;
  kewarganegaraan?: string | null;
  anakKe?: number | string | null;
  jumlahSaudara?: number | string | null;
  statusKeluarga?: string | null;
  tinggalBersama?: string | null;
  mediaSosial?: string | null;
  bahasaAsing?: string | null;
  riwayatPrestasi?: string | null;
  riwayatOrganisasi?: string | null;
  beratBadan?: number | string | null;
  tinggiBadan?: number | string | null;
  riwayatPenyakit?: string | null;
  isMerokok?: boolean | null;
  isButaWarna?: boolean | null;
  hasPenyakitMenular?: boolean | null;
  pernyataanSiswa?: boolean | null;

  // Data Orang Tua Lengkap
  keadaanOrangTua?: string | null;
  pekerjaanAyah?: string | null;
  alamatDomisiliAyah?: string | null;
  pekerjaanIbu?: string | null;
  penghasilanOrangTua?: string | null;
  pernyataanOrangTua?: boolean | null;

  // Data Sekolah Asal Lengkap
  statusSekolah?: string | null;
  tahunLulus?: string | null;
  alamatSekolah?: string | null;

  // Surat Rekomendasi Lengkap
  namaPemberiRekomendasi?: string | null;
  jabatanInstansi?: string | null;
  noHpPemberiRekomendasi?: string | null;
  catatanRekomendasi?: string | null;
  suratRekomendasiUrl?: string | null;

  // Berkas Lampiran Lengkap
  kkUrl?: string | null;
  ktpOrangTuaUrl?: string | null;
  kipUrl?: string | null;
  akteUrl?: string | null;
  ijazahUrl?: string | null;
  raporUrl?: string | null;
  prestasiUrl?: string | null;
  tampakDepanRumahUrl?: string | null;
  tampakSampingRumahUrl?: string | null;
  kamarTidurUrl?: string | null;
  ruangTamuUrl?: string | null;
}
