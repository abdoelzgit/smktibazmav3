# PPDB Upload: Implementation Plan (Opsi B: Disk Lokal yang Diperbaiki)

> Dokumen ini ditujukan untuk AI coding agent . Baca seluruh dokumen sebelum mengubah kode. Kerjakan **per fase, berurutan**. Setelah tiap fase: jalankan typecheck, lint, dan test, lalu commit terpisah per fase.

## 0. Konteks

- Proyek: formulir pendaftaran PPDB/SPMB SMK TI BAZMA (Next.js App Router, Server Actions, Prisma, `jose` untuk JWT).
- File yang ada saat ini (cari path persisnya dengan `grep`/`find`, jangan menebak):
  - File server actions PPDB yang berisi `saveDataDiriAction`, `saveRiwayatSiswaAction`, `saveDataOrangTuaAction`, `saveDataSekolahAction`, `saveRekomendasiAction`, `uploadBerkasAction`, `submitPendaftaranAction`, `getUserFromToken`, `getOrCreatePendaftaran`, `saveUploadedFile`, `deleteFileSilently`, `checkAndAutoVerifyPendaftaran`.
  - `@/lib/image.utils` (`convertImageToWebp`, `isAllowedDocument`, `isImageFile`)
  - `@/lib/upload-storage` (`getRelativeUploadPath`, `resolveUploadPath`, `toUploadUrl`)
  - `@/app/actions/auth` (`verifyToken`)
- Keputusan arsitektur: **file tetap disimpan di disk server sendiri** (bukan cloud, bukan MinIO). DB hanya menyimpan URL/key file.
- Target: stabil untuk ribuan pendaftar, termasuk lonjakan di hari pembukaan dan hari terakhir.

### Masalah yang harus diperbaiki

1. Satu action mengunggah 16 berkas sekaligus: satu gagal, semua gagal.
2. `value.arrayBuffer()` memuat seluruh file ke RAM; `sharp` memakan CPU; batas concurrency hanya per request.
3. `deleteFileSilently(existingUrl)` dijalankan **sebelum** DB diperbarui, sehingga DB bisa menunjuk ke file yang sudah hilang.
4. Validasi hanya berdasarkan `File.type` (bisa dipalsukan klien).
5. `getOrCreatePendaftaran` memakai `findUnique` lalu `create` (race condition).
6. `nomorPendaftaran` memakai `Date.now()` (bisa kembar).
7. `/uploads` berpotensi diakses publik, padahal berisi KK, KTP, dan foto rumah (data anak di bawah umur).

## 1. Aturan Umum untuk Agent

- **Jangan** mengubah perilaku di luar cakupan fase yang sedang dikerjakan.
- **Jangan** menghapus `uploadBerkasAction` sebelum Fase 6.
- **Jangan** menjalankan migrasi Prisma destruktif. Semua migrasi harus aditif. Tanyakan dulu jika perlu `migrate reset`.
- **Jangan** menyimpan konten file di DB; hanya URL/key.
- Pertahankan pesan error berbahasa Indonesia dan format `FormResult` yang ada.
- Setiap path dari input pengguna **harus** divalidasi (tolak `..`, path absolut, null byte).
- Jangan commit file `.env` atau kredensial.
- Jika ada asumsi yang tidak bisa diverifikasi dari kode, tulis di bagian "Catatan / Asumsi" di akhir PR dan lanjutkan dengan pilihan paling aman.

## 2. Konfigurasi Lingkungan

Tambahkan ke `.env.example` (bukan `.env`):

```env
UPLOAD_DIR=/data/uploads            # disk/volume terpisah dari folder aplikasi
UPLOAD_MAX_BYTES=5242880            # 5 MB
UPLOAD_MAX_PER_HOUR=60              # per user
```

Konstanta bersama di `lib/ppdb-upload.config.ts`:

```ts
export const UPLOAD_MAX_BYTES = Number(process.env.UPLOAD_MAX_BYTES ?? 5 * 1024 * 1024);
export const ALLOWED_MIME = ['image/webp', 'image/jpeg', 'image/png', 'application/pdf'] as const;

export const BERKAS_FIELDS = {
  kkUrl: 'kk',
  ktpOrangTuaUrl: 'ktp-orang-tua',
  kipUrl: 'kip',
  akteUrl: 'akte',
  ijazahUrl: 'ijazah',
  raporUrl: 'rapor',
  prestasiUrl: 'prestasi',
  bpjsUrl: 'bpjs',
  sktmUrl: 'sktm',
  suratPernyataanCpdbUrl: 'pernyataan-cpdb',
  suratTidakMerokokUrl: 'pernyataan-tidak-merokok',
  tampakDepanRumahUrl: 'rumah-depan',
  tampakSampingRumahUrl: 'rumah-samping',
  kamarTidurUrl: 'kamar-tidur',
  kamarMandiUrl: 'kamar-mandi',
  ruangTamuUrl: 'ruang-tamu',
} as const;
export type BerkasKey = keyof typeof BERKAS_FIELDS;
```

---

## Fase 0: Persiapan

**Tugas**
- [ ] Pastikan `resolveUploadPath` membaca `UPLOAD_DIR` dan **menolak path traversal** (hasil `path.resolve` harus berada di dalam `UPLOAD_DIR`; jika tidak, `throw`).
- [ ] Tambahkan unit test untuk `resolveUploadPath` (`../etc/passwd`, `/abs/path`, `a/../../b`, string kosong, null byte).
- [ ] Tambahkan `.env.example` seperti di atas.

**Kriteria selesai**
- Test path traversal lulus. Upload lama tetap berfungsi tanpa perubahan perilaku.

---

## Fase 1: Perbaikan Backend (tanpa mengubah UI)

### 1.1 `getOrCreatePendaftaran` → atomik

- Ganti `findUnique` + `create` dengan `prisma.pendaftaran.upsert({ where: { userId }, create: { userId, status: 'DRAFT' }, update: {} })`.
- Pertahankan logika: record `VERIFIED` tanpa `nomorPendaftaran` dikembalikan ke `DRAFT`; status `SUBMITTED | VERIFIED | ACCEPTED` melempar error `'Pendaftaran sudah difinalisasi dan tidak dapat diubah.'`.
- Pastikan `Pendaftaran.userId` punya `@unique` di schema. Jika belum, tambahkan lewat migrasi aditif.

### 1.2 Urutan operasi file: tulis baru → update DB → hapus lama

- Ubah `saveUploadedFile` agar **tidak** menghapus file lama. Kembalikan objek:
  ```ts
  type SavedFile = { url: string | null; staleUrl: string | null };
  ```
  `staleUrl` berisi `existingUrl` hanya jika ada file baru yang benar-benar ditulis dan URL-nya berbeda.
- Semua pemanggil (`saveDataDiriAction`, `saveRekomendasiAction`, `saveRiwayatSiswaAction`, `uploadBerkasAction`) harus: simpan file baru → `upsert` DB → **setelah sukses** panggil `deleteFileSilently(staleUrl)`.
- Jika `upsert` gagal setelah file baru ditulis, hapus file **baru** (best effort) agar tidak menjadi orphan.

### 1.3 Streaming ke disk

- Untuk non-gambar (PDF), jangan pakai `Buffer.from(await value.arrayBuffer())`. Pakai:
  ```ts
  import { pipeline } from 'node:stream/promises';
  import { Readable } from 'node:stream';
  import { createWriteStream } from 'node:fs';
  await pipeline(Readable.fromWeb(value.stream() as any), createWriteStream(targetPath, { flags: 'wx' }));
  ```
- Jika terjadi error di tengah penulisan, hapus file parsial.

### 1.4 Batasi `sharp` secara global

- Di `lib/image.utils`: `sharp.concurrency(1)` dan semaphore **level modul** (`p-limit`, limit 2) membungkus `convertImageToWebp`.
- Tambahkan `.rotate()` (EXIF) dan `limitInputPixels` yang wajar untuk mencegah image bomb.

### 1.5 Validasi magic bytes

- Tambahkan dependensi `file-type`. Fungsi `detectAndValidate(file: File)`:
  - Baca ±4 KB pertama (`file.slice(0, 4100).arrayBuffer()`), deteksi tipe sebenarnya.
  - Terima hanya `application/pdf`, `image/jpeg`, `image/png`, `image/webp`.
  - Tolak jika tipe terdeteksi tidak cocok dengan whitelist, **tanpa** mempercayai `File.type` atau ekstensi.
  - Ekstensi file akhir ditentukan dari tipe terdeteksi, bukan dari `file.name`.
- Terapkan di `saveUploadedFile`.

### 1.6 Nomor pendaftaran aman konkurensi

- Ganti `PPDB-${Date.now()}-...` dengan counter di DB.
  - Pilihan: tabel `Counter { key String @id, value Int }` dan `prisma.$transaction` dengan `upsert` + `increment`, atau sequence PostgreSQL (`nextval`) lewat `$queryRaw` jika DB-nya PostgreSQL.
  - Format contoh: `PPDB-2027-000123` (tahun + nomor 6 digit).
- Tambahkan `@unique` pada `Pendaftaran.nomorPendaftaran` bila belum ada.

**Kriteria selesai Fase 1**
- [ ] 50 pemanggilan paralel `getOrCreatePendaftaran` untuk user yang sama hanya membuat 1 baris.
- [ ] Jika `upsert` DB dipaksa gagal (mock), file lama **tidak** terhapus dan file baru dibersihkan.
- [ ] File `.exe` yang di-rename `.pdf` ditolak.
- [ ] 50 submit paralel menghasilkan 50 `nomorPendaftaran` unik.
- [ ] Typecheck dan test lulus.

---

## Fase 2: Upload Satu per Satu

### 2.1 Logika inti bersama: `lib/ppdb-upload.ts`

Fungsi murni yang dipakai server action maupun route handler:

```ts
export async function saveSingleBerkas(params: {
  userId: string;
  key: BerkasKey;
  file: File;
}): Promise<{ key: BerkasKey; url: string }>
```

Langkah di dalamnya, **berurutan**:
1. Validasi `key` terhadap `BERKAS_FIELDS` (whitelist; tolak selain itu).
2. Ambil pendaftaran lewat `getOrCreatePendaftaran` (otomatis menolak jika sudah final).
3. Validasi ukuran (`UPLOAD_MAX_BYTES`), magic bytes (Fase 1.5), nol byte ditolak.
4. Ambil `existingUrl` dari `berkasPendaftaran` untuk kolom tersebut.
5. Tulis file baru (gambar → WebP via `sharp` dengan semaphore; PDF → streaming).
6. `prisma.berkasPendaftaran.upsert` yang **hanya** mengubah satu kolom `[key]`.
7. Setelah sukses: hapus `existingUrl` (best effort).
8. Jika langkah 6 gagal: hapus file baru, lempar error.

> Catatan: `upsert` dengan satu kolom dinamis harus type-safe. Gunakan `{ [key]: url } as Prisma.BerkasPendaftaranUpdateInput` atau mapping eksplisit; jangan memakai `any`.

### 2.2 Server action tipis

```ts
export async function uploadSingleBerkasAction(formData: FormData): Promise<FormResult<{ key: BerkasKey; url: string }>>
```

- Autentikasi lewat `getUserFromToken()`, baca `key` dan `file` dari `formData`, panggil `saveSingleBerkas`, bungkus error menjadi `{ success: false, error }`.
- Tidak memanggil `checkAndAutoVerifyPendaftaran` (hanya relevan untuk status `SUBMITTED`; biarkan perilaku yang ada, tetapi jangan menambah panggilan berulang di sini).
- Tambahkan `revalidatePath('/spmb/form')` hanya jika diperlukan UI; hindari revalidate per upload jika komponen klien mengelola state sendiri.

### 2.3 Route handler (untuk progress di klien)

`app/api/ppdb/upload/route.ts` (`POST`, `multipart/form-data`, `export const runtime = 'nodejs'`):
- Autentikasi (cookie `auth_session`, fallback `admin_session` seperti `getUserFromToken`; **ekstrak `getUserFromToken` ke `lib/` agar dipakai bersama**, jangan menyalin kodenya).
- Tolak jika `Content-Length` > `UPLOAD_MAX_BYTES + 64 KB` sebelum membaca body.
- Rate limit per user (lihat Fase 5.2).
- Panggil `saveSingleBerkas`, kembalikan JSON `{ success, data, error }` dengan status HTTP yang benar (401, 400, 413, 429, 500).

**Kriteria selesai Fase 2**
- [ ] Upload satu berkas gagal tidak mengubah berkas lain.
- [ ] `key` di luar whitelist ditolak (400).
- [ ] Upload ke pendaftaran yang sudah final ditolak.
- [ ] Test integrasi untuk: sukses, ganti file (file lama terhapus), DB gagal (file lama aman), file palsu, file terlalu besar, tanpa login.

---

## Fase 3: Komponen Klien

Buat `components/spmb/FileUploadField.tsx` dan pakai untuk ke-16 field.

**Props:** `fieldKey: BerkasKey`, `label`, `accept`, `initialUrl`, `required?`, `onChange?`.

**Perilaku**
- Pilih file → validasi cepat (tipe, ukuran) → kompres **di browser** (`browser-image-compression`: `maxWidthOrHeight: 1600`, `fileType: 'image/webp'`, `maxSizeMB: 0.3`, `useWebWorker: true`). PDF dilewatkan apa adanya dan harus ≤ batas ukuran.
- Upload otomatis ke `/api/ppdb/upload` menggunakan `XMLHttpRequest` (progress event).
- State: `idle → compressing → uploading(percent) → saved | failed`.
- Retry otomatis 2x dengan exponential backoff **hanya** untuk error jaringan/5xx; jangan retry 4xx.
- Tombol **Coba lagi**, **Ganti**, dan **Batal** (`xhr.abort()`).
- Pratinjau via `URL.createObjectURL`; panggil `revokeObjectURL` saat unmount/ganti.
- Antrean klien global (hook `useUploadQueue`, maks 2 upload paralel).
- `beforeunload` memperingatkan jika ada upload berjalan.
- Aksesibilitas: label terkait input, status dibacakan (`aria-live="polite"`), tombol dapat difokus keyboard.
- Ringkasan di atas tab berkas: "X / 16 berkas tersimpan".
- Hapus ketergantungan tombol "Simpan" tab berkas pada upload massal. Jangan menghapus `uploadBerkasAction` dulu.

**Kriteria selesai Fase 3**
- [ ] Dengan Chrome DevTools throttling "Slow 3G", 16 berkas ~200 KB berhasil terunggah.
- [ ] Putus koneksi di tengah upload menghasilkan status `failed` dan tombol Coba lagi berfungsi.
- [ ] Tidak ada kebocoran object URL.
- [ ] Gambar 5 MB dari kamera HP terkompres ≤ ~400 KB sebelum dikirim.

---

## Fase 4: Penyajian File yang Aman

- Pastikan `UPLOAD_DIR` **tidak** berada di `public/` dan tidak disajikan statis oleh Nginx.
- Buat `app/api/ppdb/file/[...path]/route.ts` (`GET`, `runtime = 'nodejs'`):
  - Autentikasi. Izinkan jika `path` diawali `ppdb/{userId}/` (pemilik) **atau** pengguna adalah admin (cek role seperti pada kode yang ada).
  - Validasi path lewat `resolveUploadPath` (anti traversal). 404 jika file tidak ada, 403 jika bukan pemilik/admin.
  - Stream dengan `createReadStream` → `Readable.toWeb`.
  - Header: `Content-Type` dari ekstensi tervalidasi (whitelist), `Content-Disposition: inline`, `Cache-Control: private, no-store`, `X-Content-Type-Options: nosniff`.
- Perbarui `toUploadUrl` / `getRelativeUploadPath` agar URL baru (`/api/ppdb/file/...`) dan URL lama tetap dapat dipetakan ke path relatif.
- Skrip migrasi satu kali `scripts/migrate-upload-urls.ts` (mode `--dry-run` default; hanya menulis dengan `--apply`) bila format URL berubah.

**Kriteria selesai Fase 4**
- [ ] Tanpa login: 401. Login sebagai user lain: 403. Pemilik/admin: 200.
- [ ] Percobaan `../` pada path: 400/404.
- [ ] Respons memiliki header keamanan di atas.

---

## Fase 5: Nginx, Rate Limit, Resource

### 5.1 Nginx (berikan sebagai contoh di `docs/nginx-ppdb.conf`, jangan menimpa konfigurasi server)

```nginx
limit_req_zone $binary_remote_addr zone=ppdb_upload:10m rate=30r/m;

location /api/ppdb/upload {
    limit_req zone=ppdb_upload burst=10 nodelay;
    client_max_body_size 6m;
    client_body_timeout 60s;
    proxy_request_buffering off;
    proxy_pass http://127.0.0.1:3000;
}
```

### 5.2 Rate limit aplikasi

- Jika Redis tersedia: `rate-limiter-flexible` per `userId` (`UPLOAD_MAX_PER_HOUR`).
- Jika tidak: limiter in-memory sederhana sebagai pengaman tambahan (catat batasannya: tidak berlaku lintas instance).
- Respons 429 dengan `Retry-After`.

### 5.3 Operasional (dokumentasikan di `docs/ops-ppdb.md`)

- Menjalankan app dengan `pm2` atau Docker + batas memori, `--max-old-space-size` sesuai RAM.
- Monitor disk (alert di 80%) dan log error upload.
- Backup terjadwal `UPLOAD_DIR` dan dump DB harian ke **mesin lain** (restic/rsync), serta prosedur uji restore.

**Kriteria selesai Fase 5**
- [ ] Request ke-31 dalam semenit dari IP yang sama mendapat 429 (di Nginx).
- [ ] Body > 6 MB ditolak 413 sebelum menyentuh Next.js.

---

## Fase 6: Pembersihan dan Pengujian

- `scripts/cleanup-orphans.ts`: bandingkan file di `UPLOAD_DIR/ppdb/**` dengan semua URL di tabel terkait (`BiodataSiswa.fotoFormalUrl`, `SuratRekomendasi.suratRekomendasiUrl`, `BerkasPendaftaran.*`, `RiwayatPendaftar.prestasiData[].buktiUrl`). Hapus yang tidak direferensikan **dan** lebih tua dari 24 jam. Default `--dry-run`; log setiap penghapusan. Jadwalkan mingguan lewat cron.
- Load test `k6` di `loadtest/ppdb-upload.js`: login → isi form → upload 16 berkas (~200-300 KB). Skenario 300 dan 1000 VU. Catat RAM, CPU, p95 latency, error rate. Ambang: error rate < 1%, p95 upload < 3 dtk pada 300 VU.
- Uji kegagalan: koneksi putus, file palsu, file 0 byte, file > batas, dua tab bersamaan, akses silang antar akun.
- Setelah semua lulus: hapus `uploadBerkasAction` lama dan kode mati (`saveUploadedFile` versi lama bila sudah tidak dipakai).

**Kriteria selesai Fase 6**
- [ ] Hasil load test terdokumentasi di `docs/ops-ppdb.md`.
- [ ] Tidak ada referensi tersisa ke `uploadBerkasAction` lama.
- [ ] Skrip cleanup diuji `--dry-run` pada data staging.

---

## 3. Urutan Commit yang Disarankan

1. `chore(ppdb): env config + safe upload path resolution`
2. `fix(ppdb): atomic getOrCreatePendaftaran + safe nomor pendaftaran`
3. `fix(ppdb): write-then-update-then-delete ordering, streaming, magic-byte validation`
4. `feat(ppdb): single-file upload action + route handler`
5. `feat(ppdb): FileUploadField with compression, progress, retry`
6. `feat(ppdb): authenticated file serving`
7. `chore(ppdb): nginx sample, rate limit, ops docs`
8. `chore(ppdb): orphan cleanup, load test, remove legacy action`

## 4. Definition of Done (keseluruhan)

- [ ] Tidak ada file upload yang bisa diakses tanpa autentikasi dan kepemilikan.
- [ ] Satu berkas gagal tidak memengaruhi berkas lain.
- [ ] DB dan disk tidak pernah tidak konsisten akibat kegagalan di tengah proses.
- [ ] Server tidak memuat seluruh file ke RAM; beban `sharp` terbatas global.
- [ ] Load test lulus ambang yang ditetapkan.
- [ ] Backup ke mesin lain berjalan dan restore telah diuji.

## 5. Catatan / Asumsi (isi oleh agent)

- Path file aktual, nama model Prisma, dan jenis database: _diisi agent setelah memeriksa repo_.
- Hal yang tidak dapat diverifikasi dan keputusan yang diambil: _diisi agent_.