# Implementation Plan: CRUD Jejak Karya Siswa

Implementasi sistem pengurusan konten (CRUD) untuk **Jejak Karya** (Project/Portofolio Siswa) di SMK TI BAZMA. Workflow UI admin mengikuti standar dan layout yang ada pada **CRUD Berita** (`app/admin/berita`), disesuaikan untuk bidang-bidang khusus portofolio (kategori Website, Design, Video, IoT, tantangan, pendekatan, hasil, tim/penulis, tautan demo, serta galeri karya) dan dilengkapi **Preview Mode** khas tampilan publik Jejak Karya.

---

## User Review Required

> [!IMPORTANT]
> **Data Migration Note**:
> 1. Data dummy awal pada `lib/jejak-karya-data.ts` telah dimigrasikan ke database PostgreSQL via Prisma / Seed agar data bersifat dinamis dan konsisten.
> 2. Skema Prisma baru `JejakKarya` telah ditambahkan dan disinkronkan menggunakan Server Actions.

---

## Proposed Changes

### 1. Database & Prisma Schema

#### [MODIFY] [schema.prisma](file:///c:/Users/Hp/OneDrive/Documents/bdeul/code/smktibazmav3/prisma/schema.prisma)
- Menambahkan model `JejakKarya` dengan struktur field:
  - `id`: String (cuid)
  - `title`: String
  - `slug`: String (@unique)
  - `category`: String (`Website` | `Design` | `Video` | `IoT`)
  - `year`: String (default `"2026"`)
  - `author`: String (e.g. `"Tim Siswa RPL"`)
  - `description`: String (ringkasan singkat)
  - `challenge`: String? (tantangan proyek)
  - `approach`: String? (pendekatan solusi)
  - `outcome`: String? (hasil & dampak)
  - `whatWeDid`: String? (detail peran/pengerjaan)
  - `tags`: String? (JSON string array label/teknologi)
  - `coverImage`: String? (gambar utama 16:9)
  - `galleryImages`: String? (JSON string array gambar galeri)
  - `demoUrl`: String? (link live demo/karya)
  - `published`: Boolean (default `false`)
  - `publishedAt`: DateTime?
  - `createdAt` & `updatedAt`: DateTime

---

### 2. Server Actions & Backend Logic

#### [NEW] [jejak-karya.ts](file:///c:/Users/Hp/OneDrive/Documents/bdeul/code/smktibazmav3/app/actions/jejak-karya.ts)
- Membuat Server Actions untuk mutasi data type-safe:
  - `createJejakKaryaAction(input: CreateJejakKaryaInput)`: Membuat portofolio baru + generate slug unik.
  - `updateJejakKaryaAction(id: string, input: CreateJejakKaryaInput)`: Memperbarui portofolio + manajemen hapus file gambar lama dari disk jika diganti.
  - `deleteJejakKaryaAction(id: string)`: Menghapus data dari DB beserta file gambar terkait dari storage `public/`.
  - `getJejakKaryaByIdAction(id: string)`: Mengambil data tunggal untuk form edit admin.

#### [NEW] [jejak-karya-list.ts](file:///c:/Users/Hp/OneDrive/Documents/bdeul/code/smktibazmav3/app/actions/jejak-karya-list.ts)
- Membuat Server Actions untuk query & fetching:
  - `getJejakKaryaListAction()`: Mengambil seluruh daftar karya untuk halaman admin (filter status draft/published, search).
  - `getPublishedJejakKaryaAction(options)`: Query karya terpublikasi untuk halaman publik dengan filter kategori (`Semua`, `Website`, `Design`, `Video`, `IoT`).
  - `getJejakKaryaBySlugAction(slug: string)`: Fetch detail karya publik berdasarkan slug.

---

### 3. Admin Management UI (`app/admin/jejak-karya`)

#### [MODIFY] [page.tsx](file:///c:/Users/Hp/OneDrive/Documents/bdeul/code/smktibazmav3/app/admin/jejak-karya/page.tsx)
- Mengimplementasikan halaman daftar karya dengan UI grid 3-kolom bergaya Dribbble/portfolio shot (sama seperti `app/admin/berita/page.tsx`):
  - Card pertama khusus "Tambah Jejak Karya Baru" (Upload shortcut).
  - Tabs filter kategori: `Semua`, `Dipublikasikan`, `Draft`, `Website`, `Design`, `Video`, `IoT`.
  - Fitur pencarian real-time & tombol Hapus dengan dialog konfirmasi.

#### [NEW] [new/page.tsx](file:///c:/Users/Hp/OneDrive/Documents/bdeul/code/smktibazmav3/app/admin/jejak-karya/new/page.tsx)
- Menyiapkan halaman pembuat Jejak Karya baru:
  - Header bar sticky dengan tombol **Simpan Draft**, **Terbitkan**, **Toggle Pratinjau (Preview)**, dan **Settings Panel**.
  - **Edit Mode**: Input Judul, Deskripsi Ringkas, Unggah Cover Image (16:9), Input Tantangan (Challenge), Pendekatan (Approach), Hasil (Outcome), Tautan Live Demo, dan Unggah Galeri Gambar.
  - **Sidebar Right Panel**: Pengaturan Kategori (`Website`, `Design`, `Video`, `IoT`), Tahun Karya, Penulis/Tim Siswa, dan Tag/Teknologi.
  - **Preview Mode (Khas Jejak Karya)**: Menampilkan bentuk Pratinjau interaktif persis seperti tampilan Publik Jejak Karya (Kartu karya 16:9, badge kategori, struktur detail karya, dan tautan demo).

#### [NEW] [[id]/edit/page.tsx](file:///c:/Users/Hp/OneDrive/Documents/bdeul/code/smktibazmav3/app/admin/jejak-karya/[id]/edit/page.tsx)
- Halaman edit karya berdasarkan `id` yang pre-fill data lama dan memanggil `updateJejakKaryaAction`.

---

### 4. Public Page Integration

#### [MODIFY] [jejak-karya-client.tsx](file:///c:/Users/Hp/OneDrive/Documents/bdeul/code/smktibazmav3/app/%28public%29/jejak-karya/jejak-karya-client.tsx)
- Mengintegrasikan data dari Server Action `getPublishedJejakKaryaAction` ke dalam komponen scroll horizontal karya siswa.

#### [NEW/MODIFY] [[slug]/page.tsx](file:///c:/Users/Hp/OneDrive/Documents/bdeul/code/smktibazmav3/app/%28public%29/jejak-karya/[slug]/page.tsx)
- Menampilkan halaman detail publik secara dinamis dari database berdasarkan `slug` karya.

---

## Verification Plan

### Automated / Build Tests
- `npx prisma db push` atau `npx prisma generate` untuk memastikan skema Prisma valid.
- `npm run build` untuk memverifikasi type-safety TypeScript dan Server Actions tanpa lint/build error.

### Manual Verification
1. Buka `/admin/jejak-karya` di browser dan uji pembuatan karya baru (Draft & Publish).
2. Uji alur **Pratinjau (Preview Mode)** pada form pembuatan karya, pastikan tampilan preview 100% mirip dengan desain publik Jejak Karya.
3. Uji pengeditan karya dan penghapusan karya di admin dashboard.
4. Buka halaman publik `/jejak-karya` dan `/jejak-karya/[slug]` untuk memverifikasi animasi horizontal scroll & detail karya berjalan lancar.
