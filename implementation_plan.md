# Implementation Plan: RegisterForm Component & Server Action Integration

Rencana implementasi komponen **RegisterForm** (`components/register-form.tsx`), Server Action pendaftaran (`registerAction` di `app/actions/auth.ts`), serta penggabungan antarmuka Login & Register (Tab/Toggle Switch) di halaman **`/login`**.

---

## Technical Flow Overview

1. **User Action:** Calon peserta PPDB memilih tab/tombol *"Belum punya akun? Daftar"* di halaman login.
2. **Form Switching:** Halaman `/login` beralih menampilkan komponen `<RegisterForm />`.
3. **Form Submission:**
   - User menginput `Nama Lengkap`, `Email`, `Password`, dan `Konfirmasi Password`.
   - `RegisterForm` memangil Server Action `registerAction`.
4. **Server Action Logic (`registerAction`):**
   - Validasi data input (kelengkapan field, format email, password min. 8 karakter, serta pencocokan konfirmasi password).
   - Memeriksa apakah email sudah terdaftar di `prisma.user`.
   - Melakukan hash password dengan `bcryptjs`.
   - Menyimpan user baru ke database PostgreSQL dengan **`role: 'USER'`** (Peserta PPDB).
   - Membaca / membuat cookie session autentikasi (`auth_session`).
   - Mengembalikan `{ success: true, redirectTo: '/dashboard-ppdb/dashboard' }`.
5. **Auto Redirect:** Pengguna langsung di-redirect ke Dashboard PPDB setelah pendaftaran berhasil.

---

## User Review Required

> [!IMPORTANT]
> **Tampilan Halaman Login (`/login`):**
> Halaman login akan dilengkapi dengan tab / saklar beralih yang seamless:
> - **Tab Login:** Form login untuk Admin & Peserta PPDB eksisting.
> - **Tab Register:** Form pendaftaran akun baru khusus Peserta PPDB.
> - Kedua form juga mendukung opsi **"Masuk/Daftar dengan Google"** (yang secara otomatis memberikan role `USER` untuk akun baru).

---

## Proposed Changes

### Backend & Server Action Layer

#### [MODIFY] [app/actions/auth.ts](file:///c:/Users/Hp/OneDrive/Documents/bdeul/code/smktibazmav3/app/actions/auth.ts)
- Menambahkan Server Action `registerAction(prevState, formData)`:
  - Validasi input `name`, `email`, `password`, `confirmPassword`.
  - Cek duplikasi email di database.
  - Hash password dengan `bcrypt.hash(password, 10)`.
  - Simpan record baru ke tabel `user` dengan `role: 'USER'`.
  - Set cookie `auth_session` (JWT session).
  - Kembalikan `{ success: true, redirectTo: '/dashboard-ppdb/dashboard' }`.

---

### UI Component Layer

#### [NEW] [register-form.tsx](file:///c:/Users/Hp/OneDrive/Documents/bdeul/code/smktibazmav3/components/register-form.tsx)
- Membuat komponen client `RegisterForm`:
  - Input field: Nama Lengkap, Email, Password, Konfirmasi Password.
  - State handling error & pending state (`useActionState`).
  - Tombol submit *"Daftar Akun PPDB"*.
  - Tombol OAuth *"Daftar dengan Google"* via `signIn('google')`.
  - Link saklar *"Sudah punya akun? Login di sini"*.

#### [MODIFY] [page.tsx](file:///c:/Users/Hp/OneDrive/Documents/bdeul/code/smktibazmav3/app/login/page.tsx)
- Menyesuaikan halaman `/login` agar dapat mengalihkan tampilan antara `<LoginForm />` dan `<RegisterForm />` secara halus (menggunakan tab/state URL parameter `?mode=register`).

---

## Verification Plan

### Automated Verification
- Type Check: `npx tsc --noEmit`
- Build Check: `npm run build`

### Manual Verification
1. **Navigasi Tab/Mode Register:**
   - Buka `/login`, klik link *"Belum punya akun? Daftar"*.
   - Verifikasi antarmuka berubah menjadi form pendaftaran `<RegisterForm />`.
2. **Pendaftaran Akun Baru (Password):**
   - Isi Nama, Email, Password (min. 8 karakter), dan Konfirmasi Password.
   - Klik *"Daftar Akun PPDB"*.
   - Verifikasi user tersimpan di PostgreSQL DB dengan `role: USER`.
   - Verifikasi pengguna langsung otomatis masuk ke `/dashboard-ppdb/dashboard`.
3. **Pendaftaran dengan Google:**
   - Di tab Register, klik *"Daftar dengan Google"*.
   - Verifikasi akun Google baru terbuat di DB dengan `role: USER` dan langsung mengarah ke `/dashboard-ppdb/dashboard`.
