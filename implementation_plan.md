# Implementation Plan: Unified Auth System & Role-Based Dashboard Redirection

Menyatukan sistem autentikasi (**Single Unified Auth System**) ke 1 Server Action dan 1 Halaman Login Universal (`/login`), serta menghapus rute login redundan (`/dashboard-ppdb/login`). Sistem akan secara otomatis mengarahkan pengguna ke **Dashboard Admin** (`/admin`) jika bertipe `ADMIN` atau ke **Dashboard Peserta PPDB** (`/dashboard-ppdb/dashboard`) jika bertipe `USER`.

---

## User Review Required

> [!IMPORTANT]
> **Penyederhanaan Rute Login:**
> 1. **Penghapusan `/dashboard-ppdb/login`:** Halaman `/dashboard-ppdb/login` **aman untuk dihapus**. Seluruh tombol login (baik di header utama sekolah maupun landing page PPDB) akan diarahkan langsung ke `/login`.
> 2. **Redirect Otomatis jika URL Lama Diakses:** Di middleware, jika ada pengguna yang masih mengakses URL `/dashboard-ppdb/login`, sistem akan secara otomatis mengalihkannya (*redirect*) ke `/login`.

---

## Proposed Changes

### Database Layer (Prisma)

#### [MODIFY] [schema.prisma](file:///c:/Users/Hp/OneDrive/Documents/bdeul/code/smktibazmav3/prisma/schema.prisma)
- Tambahkan enum `Role` (`ADMIN`, `USER`).
- Tambahkan field `role Role @default(USER)` pada tabel `User`.
- Jalankan `npx prisma db push` untuk memperbarui database PostgreSQL.

---

### Unified Auth Server Actions

#### [MODIFY] [app/actions/auth.ts](file:///c:/Users/Hp/OneDrive/Documents/bdeul/code/smktibazmav3/app/actions/auth.ts)
- Konsolidasi seluruh logika autentikasi:
  - `loginAction(formData)`: Verifikasi email & password, masukkan `role` ke JWT token payload (`auth_session`), dan kembalikan `{ success: true, role, redirectTo }`.
  - `registerPpdbAction(formData)`: Registrasi peserta PPDB baru (default `role: USER`), buat JWT session, dan kembalikan `redirectTo: '/dashboard-ppdb/dashboard'`.
  - `logoutAction()`: Hapus cookie `auth_session` dan revalidate path.

#### [DELETE] [ppdb-auth.ts](file:///c:/Users/Hp/OneDrive/Documents/bdeul/code/smktibazmav3/app/actions/ppdb-auth.ts)
- Hapus file Server Action PPDB lama ini karena seluruh fungsinya sudah disatukan di `app/actions/auth.ts`.

---

### Middleware & Navigation Guard

#### [MODIFY] [lib/middleware/auth.ts](file:///c:/Users/Hp/OneDrive/Documents/bdeul/code/smktibazmav3/lib/middleware/auth.ts)
- Perbarui `verifyToken` untuk membaca `role` dari JWT token.
- Pada `handleAuthMiddleware`:
  - **Redirect Legacy Login Path:** Jika rute yang diminta adalah `/dashboard-ppdb/login`, redirect langsung ke `/login`.
  - **Single Login Guard:** Jika user yang sudah terautentikasi membuka `/login`, redirect otomatis sesuai rolenya (`ADMIN` $\rightarrow$ `/admin`, `USER` $\rightarrow$ `/dashboard-ppdb/dashboard`).
  - **Role Guard:** Jika user ber-role `USER` mencoba membuka `/admin`, redirect ke `/dashboard-ppdb/dashboard`.

---

### UI Components & Pages

#### [MODIFY] [components/login-form.tsx](file:///c:/Users/Hp/OneDrive/Documents/bdeul/code/smktibazmav3/components/login-form.tsx)
- Perbarui form agar menggunakan `loginAction` dari `@/app/actions/auth`.
- Saat login sukses, jalankan `router.push(result.redirectTo)` untuk mengarahkan pengguna ke dashboard yang sesuai secara dinamis.

#### [DELETE] [app/dashboard-ppdb/login/page.tsx](file:///c:/Users/Hp/OneDrive/Documents/bdeul/code/smktibazmav3/app/dashboard-ppdb/login/page.tsx)
- Hapus folder/file rute login PPDB yang redundan.

---

## Verification Plan

### Automated Tests / Commands
- Database Schema Sync: `npx prisma db push`
- TypeScript Verification: `npx tsc --noEmit`

### Manual Verification
1. **Navigasi Login:**
   - Buka `/dashboard-ppdb/login` di URL browser $\rightarrow$ Harus otomatis ter-redirect ke `/login`.
2. **Login Admin & User:**
   - Login di `/login` dengan kredensial Admin $\rightarrow$ Masuk ke `/admin`.
   - Logout, lalu login di `/login` dengan kredensial Peserta PPDB $\rightarrow$ Masuk ke `/dashboard-ppdb/dashboard`.
3. **Proteksi Role:**
   - Login sebagai Peserta PPDB, coba buka `/admin` $\rightarrow$ Otomatis diredirect kembali ke `/dashboard-ppdb/dashboard`.
