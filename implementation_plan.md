# Implementation Plan - Setup Model Prisma & Server Action Create Berita

Menyusun skema basis data Prisma dan Server Action (`'use server'`) untuk fitur pembuat berita pada **SMK TI BAZMA v3** sesuai dengan aturan proyek `AGENTS.md`.

## User Review Required

> [!IMPORTANT]
> 1. **Pembaruan Skema Prisma (`Berita`)**: Perlu menambahkan field `category` (default: `"Akademik"`) ke model `Berita` di [`prisma/schema.prisma`](file:///c:/Users/Hp/OneDrive/Documents/bdeul/code/smktibazmav3/prisma/schema.prisma).
> 2. **Eksekusi Migration/Push**: Setelah memperbarui `schema.prisma`, command `npx prisma db push` atau `npx prisma generate` perlu dijalankan untuk memperbarui Prisma Client di environment lokal.

## Proposed Changes

---

### Database Layer (Prisma Schema)

#### [MODIFY] [schema.prisma](file:///c:/Users/Hp/OneDrive/Documents/bdeul/code/smktibazmav3/prisma/schema.prisma)
- Menambahkan field `category String @default("Akademik")` pada `model Berita`.
- Memastikan field pendukung (`id`, `title`, `slug`, `excerpt`, `content` (JSON/Text dari blocks), `coverImage`, `published`, `publishedAt`) terdefinisi dengan rapi.

```prisma
model Berita {
  id          String    @id @default(cuid())
  title       String
  slug        String    @unique
  category    String    @default("Akademik")
  excerpt     String?
  content     String    @db.Text
  coverImage  String?
  published   Boolean   @default(false)
  publishedAt DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@map("berita")
}
```

---

### Backend Layer (Next.js Server Actions)

#### [NEW] [berita.ts](file:///c:/Users/Hp/OneDrive/Documents/bdeul/code/smktibazmav3/app/actions/berita.ts)
- Membuat Server Action file `app/actions/berita.ts` berlabel `'use server'`.
- Tipe payload input:
  ```typescript
  export type CreateBeritaInput = {
    title: string;
    excerpt?: string;
    category?: string;
    coverSrc?: string | null;
    blocks: Array<{
      id: string;
      type: "paragraph" | "heading" | "image";
      content: string;
      imageSrc?: string;
      caption?: string;
    }>;
    status: "draft" | "published";
  };
  ```
- Fungsi helper `generateSlug(title: string)` untuk membuat slug URL ramah SEO & unik (contoh: `kegiatan-ldks-2026-a3f2`).
- Fungsi Server Action `createBeritaAction(input: CreateBeritaInput): Promise<ActionResult<{ id: string; slug: string }>>`.
- Validasi data input (memastikan `title` tidak kosong).
- Penggunaan `prisma.berita.create(...)`.
- Pemanggilan `revalidatePath('/admin/berita')` dan `revalidatePath('/berita')` setelah mutasi berhasil.
- Error handling standar `{ success: false, error: "Pesan error" }`.

---

### Frontend Integration

#### [MODIFY] [page.tsx](file:///c:/Users/Hp/OneDrive/Documents/bdeul/code/smktibazmav3/app/admin/berita/new/page.tsx)
- Menghubungkan fungsi `handleSaveDraft` & `handlePublish` ke `createBeritaAction`.
- Menambahkan state `isSubmitting` (loading indicator pada tombol "Simpan Draft" & "Terbitkan").
- Navigasi otomatis ke halaman daftar berita `/admin/berita` saat sukses menerbitkan/menyimpan.

---

## Verification Plan

### Automated Verification
- Melakukan verifikasi tipe TypeScript `npx tsc --noEmit` untuk memastikan tipe Server Action type-safe.

### Manual Verification
- Uji coba pengisian berita baru (Judul, Ringkasan, Cover Image, Kategori, Blok Konten).
- Menekan tombol **Simpan Draft** dan memastikan status tersimpan sebagai `published: false` di basis data.
- Menekan tombol **Terbitkan** dan memastikan status tersimpan sebagai `published: true` dengan timestamp `publishedAt`.
- Memastikan halaman berhasil dialihkan (*redirect*) ke `/admin/berita`.
