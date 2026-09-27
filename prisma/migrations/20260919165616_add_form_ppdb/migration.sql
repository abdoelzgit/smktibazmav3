-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "StatusPendaftaran" AS ENUM ('DRAFT', 'SUBMITTED', 'VERIFIED', 'REJECTED', 'ACCEPTED');

-- CreateEnum
CREATE TYPE "StatusKeluarga" AS ENUM ('ANAK_KANDUNG', 'ANAK_TIRI', 'ANAK_ANGKAT');

-- CreateEnum
CREATE TYPE "KeadaanOrangTua" AS ENUM ('LENGKAP', 'YATIM', 'PIATU', 'YATIM_PIATU');

-- CreateEnum
CREATE TYPE "StatusSekolah" AS ENUM ('NEGERI', 'SWASTA');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE "pendaftaran_ppdb" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nomorPendaftaran" TEXT,
    "status" "StatusPendaftaran" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pendaftaran_ppdb_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "biodata_siswa" (
    "id" TEXT NOT NULL,
    "pendaftaranId" TEXT NOT NULL,
    "namaLengkap" TEXT NOT NULL,
    "email" TEXT,
    "tempatLahir" TEXT,
    "tanggalLahir" TIMESTAMP(3),
    "nik" TEXT,
    "nisn" TEXT,
    "kewarganegaraan" TEXT DEFAULT 'Indonesia',
    "anakKe" INTEGER,
    "jumlahSaudara" INTEGER,
    "statusKeluarga" "StatusKeluarga" DEFAULT 'ANAK_KANDUNG',
    "tinggalBersama" TEXT,
    "alamatLengkap" TEXT,
    "noHpWhatsapp" TEXT,
    "mediaSosial" TEXT,
    "bahasaAsing" TEXT,
    "riwayatPrestasi" TEXT,
    "riwayatOrganisasi" TEXT,
    "beratBadan" DOUBLE PRECISION,
    "tinggiBadan" DOUBLE PRECISION,
    "riwayatPenyakit" TEXT,
    "isMerokok" BOOLEAN DEFAULT false,
    "isButaWarna" BOOLEAN DEFAULT false,
    "hasPenyakitMenular" BOOLEAN DEFAULT false,
    "pernyataanSiswa" BOOLEAN DEFAULT false,
    "fotoFormalUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "biodata_siswa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_orang_tua" (
    "id" TEXT NOT NULL,
    "pendaftaranId" TEXT NOT NULL,
    "namaAyah" TEXT,
    "pekerjaanAyah" TEXT,
    "alamatDomisiliAyah" TEXT,
    "namaIbu" TEXT,
    "pekerjaanIbu" TEXT,
    "noHpOi" TEXT,
    "keadaanOrangTua" "KeadaanOrangTua" DEFAULT 'LENGKAP',
    "penghasilanOrangTua" TEXT,
    "pernyataanOrangTua" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "data_orang_tua_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_sekolah_asal" (
    "id" TEXT NOT NULL,
    "pendaftaranId" TEXT NOT NULL,
    "namaSekolahAsal" TEXT,
    "npsnSekolah" TEXT,
    "statusSekolah" "StatusSekolah" DEFAULT 'NEGERI',
    "tahunLulus" TEXT,
    "alamatSekolah" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "data_sekolah_asal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "surat_rekomendasi" (
    "id" TEXT NOT NULL,
    "pendaftaranId" TEXT NOT NULL,
    "namaPemberiRekomendasi" TEXT,
    "jabatanInstansi" TEXT,
    "noHpPemberiRekomendasi" TEXT,
    "suratRekomendasiUrl" TEXT,
    "catatanRekomendasi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "surat_rekomendasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "berkas_pendaftaran" (
    "id" TEXT NOT NULL,
    "pendaftaranId" TEXT NOT NULL,
    "kkUrl" TEXT,
    "ktpOrangTuaUrl" TEXT,
    "kipUrl" TEXT,
    "akteUrl" TEXT,
    "ijazahUrl" TEXT,
    "raporUrl" TEXT,
    "prestasiUrl" TEXT,
    "tampakDepanRumahUrl" TEXT,
    "tampakSampingRumahUrl" TEXT,
    "kamarTidurUrl" TEXT,
    "ruangTamuUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "berkas_pendaftaran_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pendaftaran_ppdb_userId_key" ON "pendaftaran_ppdb"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "pendaftaran_ppdb_nomorPendaftaran_key" ON "pendaftaran_ppdb"("nomorPendaftaran");

-- CreateIndex
CREATE UNIQUE INDEX "biodata_siswa_pendaftaranId_key" ON "biodata_siswa"("pendaftaranId");

-- CreateIndex
CREATE UNIQUE INDEX "data_orang_tua_pendaftaranId_key" ON "data_orang_tua"("pendaftaranId");

-- CreateIndex
CREATE UNIQUE INDEX "data_sekolah_asal_pendaftaranId_key" ON "data_sekolah_asal"("pendaftaranId");

-- CreateIndex
CREATE UNIQUE INDEX "surat_rekomendasi_pendaftaranId_key" ON "surat_rekomendasi"("pendaftaranId");

-- CreateIndex
CREATE UNIQUE INDEX "berkas_pendaftaran_pendaftaranId_key" ON "berkas_pendaftaran"("pendaftaranId");

-- AddForeignKey
ALTER TABLE "pendaftaran_ppdb" ADD CONSTRAINT "pendaftaran_ppdb_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "biodata_siswa" ADD CONSTRAINT "biodata_siswa_pendaftaranId_fkey" FOREIGN KEY ("pendaftaranId") REFERENCES "pendaftaran_ppdb"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_orang_tua" ADD CONSTRAINT "data_orang_tua_pendaftaranId_fkey" FOREIGN KEY ("pendaftaranId") REFERENCES "pendaftaran_ppdb"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_sekolah_asal" ADD CONSTRAINT "data_sekolah_asal_pendaftaranId_fkey" FOREIGN KEY ("pendaftaranId") REFERENCES "pendaftaran_ppdb"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surat_rekomendasi" ADD CONSTRAINT "surat_rekomendasi_pendaftaranId_fkey" FOREIGN KEY ("pendaftaranId") REFERENCES "pendaftaran_ppdb"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "berkas_pendaftaran" ADD CONSTRAINT "berkas_pendaftaran_pendaftaranId_fkey" FOREIGN KEY ("pendaftaranId") REFERENCES "pendaftaran_ppdb"("id") ON DELETE CASCADE ON UPDATE CASCADE;
