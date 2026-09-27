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
  fotoFormalUrl?: string | null;
  namaAyah?: string | null;
  namaIbu?: string | null;
  noHpOrangTua?: string | null;
  berkasCount?: number;
}
