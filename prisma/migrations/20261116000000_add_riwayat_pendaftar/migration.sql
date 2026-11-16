CREATE TABLE "riwayat_pendaftar" (
    "id" TEXT NOT NULL,
    "pendaftaranId" TEXT NOT NULL,
    "prestasiData" TEXT,
    "organisasiData" TEXT,
    "bahasaData" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "riwayat_pendaftar_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "riwayat_pendaftar_pendaftaranId_key" ON "riwayat_pendaftar"("pendaftaranId");

ALTER TABLE "riwayat_pendaftar"
ADD CONSTRAINT "riwayat_pendaftar_pendaftaranId_fkey"
FOREIGN KEY ("pendaftaranId") REFERENCES "pendaftaran_ppdb"("id") ON DELETE CASCADE ON UPDATE CASCADE;
