ALTER TABLE "riwayat_pendaftar"
  ALTER COLUMN "prestasiData" TYPE JSONB USING "prestasiData"::JSONB,
  ALTER COLUMN "organisasiData" TYPE JSONB USING "organisasiData"::JSONB,
  ALTER COLUMN "bahasaData" TYPE JSONB USING "bahasaData"::JSONB;
