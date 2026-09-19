# Implementation Plan: Analisis Formulir Pendaftaran & Perancangan Skema Prisma PPDB

Rencana ini mencakup hasil analisis mendalam terhadap komponen UI `FormulirPendaftaran` (5 Tab: **Data Diri**, **Data Orang Tua**, **Upload Berkas**, **Surat Rekomendasi**, dan **Data Sekolah Asal**) serta perancangan **Skema Prisma (Data Model)** yang terstruktur, type-safe, dan relasional dengan model `User`.

---

## Hasil Analisis Input Field Formulir Pendaftaran

Berdasarkan analisis file komponen UI pada folder `components/tabs/`:

### 1. Tab Data Diri (`DataDiriTab.tsx`)
- **Identitas Siswa:** `namaLengkap`, `email`, `nik`, `nisn`, `tempatLahir`, `tanggalLahir`, `kewarganegaraan`.
- **Informasi Keluarga & Sosial:** `anakKe`, `jumlahSaudara`, `statusDalamKeluarga` (Anak Kandung/Tiri/Angkat), `tinggalBersama`, `alamatLengkap`, `noHpWhatsapp`, `mediaSosial`.
- **Keterampilan & Prestasi:** `bahasaAsing`, `riwayatPrestasi`, `riwayatOrganisasi`.
- **Kondisi Fisik & Kesehatan:** `beratBadan` (float/int), `tinggiBadan` (float/int), `riwayatPenyakit`, `riwayatMerokok` (Boolean/String), `isButaWarna` (Boolean), `hasPenyakitMenular` (Boolean).
- **Pernyataan:** `pernyataanSiswa` (Boolean).
- **Foto:** `fotoFormalUrl`.

### 2. Tab Data Orang Tua (`DataOrangTuaTab.tsx`)
- **Data Ayah:** `namaAyah`, `pekerjaanAyah`, `alamatDomisiliAyah`.
- **Data Ibu:** `namaIbu`, `pekerjaanIbu`.
- **Kontak & Kondisi:** `noHpOi`, `keadaanOrangTua` (Lengkap, Yatim, Piatu, Yatim Piatu), `penghasilanOrangTua`.
- **Pernyataan:** `pernyataanOrangTua` (Boolean).

### 3. Tab Upload Berkas (`BerkasTab.tsx`)
- **Dokumen Pribadi:** `kkUrl`, `ktpOrangTuaUrl`, `kipUrl` (opsional), `akteUrl`, `ijazahUrl`, `raporUrl`, `prestasiUrl` (opsional).
- **Dokumen Foto Rumah:** `tampakDepanRumahUrl`, `tampakSampingRumahUrl`, `kamarTidurUrl`, `ruangTamuUrl`.

### 4. Tab Surat Rekomendasi (`SuratRekomendasiTab.tsx`)
- **Informasi Pemberi:** `namaPemberiRekomendasi`, `jabatanInstansi`, `noHpPemberiRekomendasi`.
- **Berkas & Catatan:** `suratRekomendasiUrl`, `catatanRekomendasi`.

### 5. Tab Data Sekolah Asal (`DataSekolahAsalTab.tsx`)
- **Informasi Sekolah:** `namaSekolahAsal`, `npsnSekolah`, `statusSekolah` (Negeri/Swasta), `tahunLulus`, `alamatSekolahAsal`.

---

## User Review Required

> [!IMPORTANT]
> **Struktur Model Relasional Prisma:**
> Kami merekomendasikan pemisahan model menjadi relasi 1-to-1 dengan tabel `Pendaftaran` agar rapi dan terukur:
> 1. `Pendaftaran`: Tabel utama status pendaftaran (`status`: `DRAFT`, `SUBMITTED`, `VERIFIED`, `ACCEPTED`, `REJECTED`).
> 2. `BiodataSiswa`: Menyimpan data detail siswa dari Tab Data Diri.
> 3. `DataOrangTua`: Menyimpan detail ayah, ibu, dan wali.
> 4. `DataSekolahAsal`: Menyimpan riwayat sekolah SMP/MTs.
> 5. `SuratRekomendasi`: Menyimpan data & dokumen rekomendasi.
> 6. `BerkasPendaftaran`: Menyimpan seluruh URL file upload (KK, KTP, foto rumah, dsb).

---

## Open Questions

> [!NOTE]
> 1. **Penyimpanan File Upload:** Apakah berkas (PDF/Gambar foto rumah) akan di-upload ke sistem lokal (`public/uploads/ppdb/`) atau cloud storage? (Rekomendasi: `public/uploads/ppdb/` via Server Actions upload helper).
> 2. **Alur Simpan:** Apakah peserta diperbolehkan menyimpan *draft* pendaftaran secara bertahap (per-tab) atau wajib submit sekaligus? (Rekomendasi: Dukung simpan draft per-tab dengan status `DRAFT`).

---

## Proposed Changes

### Database Layer (Prisma Schema)

#### [MODIFY] [schema.prisma](file:///c:/Users/Hp/OneDrive/Documents/bdeul/code/smktibazmav3/prisma/schema.prisma)
Menambahkan Enum & Model berikut ke `prisma/schema.prisma`:

```prisma
enum StatusPendaftaran {
  DRAFT
  SUBMITTED
  VERIFIED
  REJECTED
  ACCEPTED
}

enum StatusKeluarga {
  ANAK_KANDUNG
  ANAK_TIRI
  ANAK_ANGKAT
}

enum KeadaanOrangTua {
  LENGKAP
  YATIM
  PIATU
  YATIM_PIATU
}

enum StatusSekolah {
  NEGERI
  SWASTA
}

model Pendaftaran {
  id               String            @id @default(cuid())
  userId           String            @unique
  user             User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  nomorPendaftaran String?           @unique
  status           StatusPendaftaran @default(DRAFT)
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt

  biodata          BiodataSiswa?
  orangTua         DataOrangTua?
  sekolahAsal      DataSekolahAsal?
  rekomendasi      SuratRekomendasi?
  berkas           BerkasPendaftaran?

  @@map("pendaftaran_ppdb")
}

model BiodataSiswa {
  id                 String          @id @default(cuid())
  pendaftaranId     String          @unique
  pendaftaran       Pendaftaran     @relation(fields: [pendaftaranId], references: [id], onDelete: Cascade)
  
  namaLengkap        String
  email              String?
  tempatLahir        String?
  tanggalLahir       DateTime?
  nik                String?
  nisn               String?
  kewarganegaraan    String?         @default("Indonesia")
  anakKe             Int?
  jumlahSaudara      Int?
  statusKeluarga     StatusKeluarga? @default(ANAK_KANDUNG)
  tinggalBersama     String?
  alamatLengkap      String?
  noHpWhatsapp       String?
  mediaSosial        String?
  bahasaAsing        String?
  riwayatPrestasi    String?
  riwayatOrganisasi  String?
  beratBadan         Float?
  tinggiBadan        Float?
  riwayatPenyakit    String?
  isMerokok          Boolean?        @default(false)
  isButaWarna        Boolean?        @default(false)
  hasPenyakitMenular Boolean?        @default(false)
  pernyataanSiswa    Boolean?        @default(false)
  fotoFormalUrl      String?

  createdAt          DateTime        @default(now())
  updatedAt          DateTime        @updatedAt

  @@map("biodata_siswa")
}

model DataOrangTua {
  id                    String           @id @default(cuid())
  pendaftaranId        String           @unique
  pendaftaran          Pendaftaran      @relation(fields: [pendaftaranId], references: [id], onDelete: Cascade)

  namaAyah              String?
  pekerjaanAyah         String?
  alamatDomisiliAyah    String?
  namaIbu               String?
  pekerjaanIbu          String?
  noHpOi                String?
  keadaanOrangTua       KeadaanOrangTua? @default(LENGKAP)
  penghasilanOrangTua   String?
  pernyataanOrangTua    Boolean?         @default(false)

  createdAt             DateTime         @default(now())
  updatedAt             DateTime         @updatedAt

  @@map("data_orang_tua")
}

model DataSekolahAsal {
  id               String         @id @default(cuid())
  pendaftaranId   String         @unique
  pendaftaran     Pendaftaran    @relation(fields: [pendaftaranId], references: [id], onDelete: Cascade)

  namaSekolahAsal  String?
  npsnSekolah      String?
  statusSekolah    StatusSekolah? @default(NEGERI)
  tahunLulus       String?
  alamatSekolah    String?

  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt

  @@map("data_sekolah_asal")
}

model SuratRekomendasi {
  id                        String      @id @default(cuid())
  pendaftaranId            String      @unique
  pendaftaran              Pendaftaran @relation(fields: [pendaftaranId], references: [id], onDelete: Cascade)

  namaPemberiRekomendasi    String?
  jabatanInstansi           String?
  noHpPemberiRekomendasi    String?
  suratRekomendasiUrl       String?
  catatanRekomendasi        String?

  createdAt                 DateTime    @default(now())
  updatedAt                 DateTime    @updatedAt

  @@map("surat_rekomendasi")
}

model BerkasPendaftaran {
  id                    String      @id @default(cuid())
  pendaftaranId        String      @unique
  pendaftaran          Pendaftaran @relation(fields: [pendaftaranId], references: [id], onDelete: Cascade)

  kkUrl                 String?
  ktpOrangTuaUrl        String?
  kipUrl                String?
  akteUrl               String?
  ijazahUrl             String?
  raporUrl              String?
  prestasiUrl           String?
  tampakDepanRumahUrl   String?
  tampakSampingRumahUrl String?
  kamarTidurUrl         String?
  ruangTamuUrl          String?

  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt

  @@map("berkas_pendaftaran")
}
```

---

### Backend & Server Actions (Next Phase)

#### [NEW] [app/actions/ppdb-form.ts](file:///c:/Users/Hp/OneDrive/Documents/bdeul/code/smktibazmav3/app/actions/ppdb-form.ts)
- Membuat Server Action `'use server'` untuk menyimpan/update data tiap tab (`saveDataDiriAction`, `saveDataOrangTuaAction`, `saveDataSekolahAction`, `saveRekomendasiAction`, `uploadBerkasAction`, `submitPendaftaranAction`).

---

## Verification Plan

### Automated Verification
1. Sinkronisasi skema Prisma ke database PostgreSQL:
   ```powershell
   npx prisma db push
   ```
2. Generate Prisma Client:
   ```powershell
   npx prisma generate
   ```
3. Type Checking:
   ```powershell
   npx tsc --noEmit
   ```

### Manual Verification
1. Buka Prisma Studio (`npx prisma studio`) untuk memverifikasi tabel `pendaftaran_ppdb`, `biodata_siswa`, `data_orang_tua`, `data_sekolah_asal`, `surat_rekomendasi`, dan `berkas_pendaftaran` berhasil terbuat dengan relasi yang benar ke tabel `users`.
