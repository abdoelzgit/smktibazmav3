<<<<<<< HEAD
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
=======
# Implementation Plan - Performance & Memory Leak Cleanup

Comprehensive optimization to eliminate cumulative memory leaks, un-throttled scroll listeners, layout thrashing, and orphaned GSAP instances during client-side route navigation in Next.js.

## Problem Summary
As users navigate between pages (e.g., Home → Sekolah → Mitra → Asrama), the web app becomes progressively sluggish. This is caused by:
1. **Un-throttled Scroll Listeners & Layout Thrashing** in `Navbar`: Executing `document.querySelectorAll` and `getBoundingClientRect()` on every scroll frame (60-120 FPS).
2. **High-Frequency React State Updates** in `MitraProfile`: Invoking `useState` (`setTranslateX`) 60-120 times per second during scroll, forcing entire component tree re-renders on every scroll tick.
3. **Continuous ResizeObserver Thrashing** in `SmoothScroll`: Un-debounced `ResizeObserver` on `document.body` invoking `ScrollTrigger.refresh()` layout measurements.
4. **Incomplete GSAP & Listener Cleanup**: Orphaned animation frames and listeners lingering in memory after route navigation.
>>>>>>> 8856833137fbb3e2445d693f7047b225de88c03b

---

## Proposed Changes

<<<<<<< HEAD
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
=======
### 1. Navbar Component
#### [MODIFY] [`components/navbar.tsx`](file:///c:/Users/Hp/OneDrive/Documents/bdeul/code/smktibazmav3/components/navbar.tsx)
- Cache `[data-nav-theme]` elements and update cache only on route change (`pathname`) or window `resize`.
- Throttle `onScroll` handler using `requestAnimationFrame` to avoid layout reflows on every scroll tick.
- Add proper `cancelAnimationFrame` and `removeEventListener` cleanup on unmount or route change.

---

### 2. Mitra Profile Component
#### [MODIFY] [`app/(public)/mitra/mitra-profile.tsx`](file:///c:/Users/Hp/OneDrive/Documents/bdeul/code/smktibazmav3/app/(public)/mitra/mitra-profile.tsx)
- Replace high-frequency React `useState` (`setTranslateX`) during scroll with Direct DOM Mutation (`trackRef.current.style.transform`).
- Throttle `setActiveIndex` updates so React re-renders only occur when the active slide index actually changes.
- Ensure all RAF loops and scroll event listeners are cleanly terminated on component unmount.

---

### 3. Smooth Scroll Component
#### [MODIFY] [`components/smooth-scroll.tsx`](file:///c:/Users/Hp/OneDrive/Documents/bdeul/code/smktibazmav3/components/smooth-scroll.tsx)
- Debounce `ResizeObserver` on `document.body` to prevent rapid consecutive `ScrollTrigger.refresh()` calls during DOM mutations.
- Ensure route changes (`pathname`) trigger a clean `lenis.resize()` and `ScrollTrigger.refresh(true)` after DOM settle.

---

### 4. Animation Cleanup Audit
#### [MODIFY] [`app/(public)/hero-carousel.tsx`](file:///c:/Users/Hp/OneDrive/Documents/bdeul/code/smktibazmav3/app/(public)/hero-carousel.tsx)
#### [MODIFY] [`app/(public)/sekolah/section/timeline.tsx`](file:///c:/Users/Hp/OneDrive/Documents/bdeul/code/smktibazmav3/app/(public)/sekolah/section/timeline.tsx)
- Ensure all GSAP timelines and timers (`setTimeout`, `setInterval`) are strictly scoped inside `gsap.context()` or `useEffect` with explicit cleanup (`ctx.revert()`, `clearTimeout`).
>>>>>>> 8856833137fbb3e2445d693f7047b225de88c03b

---

## Verification Plan

<<<<<<< HEAD
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
=======
### Manual Verification
1. **Navigation Stress Test**: Open DevTools Performance / Memory tab. Navigate sequentially across all pages (`/` → `/sekolah` → `/mitra` → `/asrama` → `/spmb` → `/`...) 10+ times.
2. **Memory Heap Inspection**: Verify JS Heap size remains stable and does not grow continuously.
3. **Scroll Performance**: Verify smooth 60 FPS scrolling on `/sekolah` and `/mitra` without main-thread jank or Layout Thrashing.
4. **Build & Type Check**: Ensure `npm run build` or Next.js dev server runs with zero errors.
>>>>>>> 8856833137fbb3e2445d693f7047b225de88c03b
