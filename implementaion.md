# Implementation Plan — Middleware Proteksi Admin Page

Rencana ini mengatur penerapan **Next.js Middleware** untuk mengamankan seluruh rute Admin (`/admin/*`) dan mengelola pengalihan pengguna (authentication flow) secara efisien, aman, dan modular.

---

## Technical Standards & Requirements
- **Spesifik**: Menggunakan `config.matcher` agar middleware HANYA berjalan pada rute yang membutuhkan (`/admin/:path*`, `/login`), sehingga tidak membebani rute publik atau static assets.
- **Ringan**: Hanya melakukan verifikasi token JWT / session cookie tanpa query database atau I/O berat.
- **Modular**: Memisahkan logika concern ke file helper terpisah (`lib/middleware/auth.ts`, `lib/middleware/types.ts`).
- **Edge-compatible**: Menggunakan library [`jose`](https://github.com/panva/jose) untuk verifikasi JWT yang fully compatible dengan Next.js Edge Runtime.
- **Aman**: Membungkus verifikasi token dalam blok `try...catch` untuk mengantisipasi token malformed/expired tanpa menyebabkan unhandled runtime error.
- **Jelas**: Mengarahkan pengguna dengan `NextResponse.redirect` beserta query parameter yang bermakna (`callbackUrl`, `reason=unauthorized`) daripada mengembalikan status 404 atau pesan generic.

---

## User Review Required

> [!IMPORTANT]
> 1. **Install Library `jose`**: Perlu menambah paket `jose` sebagai dependency untuk verifikasi JWT di Edge Runtime.
> 2. **Nama Cookie Session**: Default nama cookie diset ke `admin_session` (atau `token`). Bisa disesuaikan dengan skema authentikasi backend Server Action proyek.
> 3. **Environment Variable**: Membutuhkan `JWT_SECRET` pada file `.env.local` / environment variables.

---

## Proposed Changes

### Dependencies

#### [MODIFY] [`package.json`](file:///c:/Users/Hp/OneDrive/Documents/bdeul/code/smktibazmav3/package.json)
- Menambahkan dependency `jose` (`npm install jose`).

---

### Middleware Modules & Helper

#### [NEW] [`lib/middleware/auth.ts`](file:///c:/Users/Hp/OneDrive/Documents/bdeul/code/smktibazmav3/lib/middleware/auth.ts)
- Membuat modul autentikasi terisolasi:
  - `verifyAdminToken(token: string)` menggunakan `jose.jwtVerify`.
  - `handleAuthMiddleware(request: NextRequest)` untuk menangani logika evaluasi rute `/admin` dan `/login`.

#### [NEW] [`middleware.ts`](file:///c:/Users/Hp/OneDrive/Documents/bdeul/code/smktibazmav3/middleware.ts)
- Menyiapkan entrypoint Next.js Middleware di root proyek.
- Mendefinisikan `config.matcher`:
  ```typescript
  export const config = {
    matcher: ['/admin/:path*', '/login'],
  }
  ```
- Memanggil `handleAuthMiddleware(request)` dari modul `lib/middleware/auth.ts`.

---

## Detailed Logic Flow

```mermaid
flowchart TD
    A[Request Masuk] --> B{Path Matcher Check}
    B -- Non-Admin / Asset -- Direct Pass Through
    B -- /admin/* atau /login -- C[Ambil Cookie Admin Session]
    C --> D{Cookie Ada?}
    D -- Tidak Ada & akses /admin -- E[Redirect ke /login?callbackUrl=...&reason=unauthorized]
    D -- Tidak Ada & akses /login -- F[Izinkan Akses ke /login]
    D -- Ada -- G[Verifikasi JWT via jose (try-catch)]
    G -- Invalid / Expired -- H[Hapus Cookie + Redirect ke /login?reason=session_expired]
    G -- Valid & akses /login -- I[Redirect ke /admin]
    G -- Valid & akses /admin -- J[NextResponse.next()]
```

---

## Verification Plan

### Automated / Command Verification
1. Install dependency:
   ```powershell
   npm install jose
   ```
2. Cek build & TypeScript linting untuk memastikan tidak ada kesalahan Edge runtime:
   ```powershell
   npm run build
   ```

### Manual Verification
1. **Akses tanpa Token**: Buka `/admin` -> Harus otomatis ter-redirect ke `/login?callbackUrl=%2Fadmin&reason=unauthorized`.
2. **Akses dengan Valid Token**: Simpan cookie `admin_session` yang valid di browser -> Buka `/admin` -> Berhasil masuk dashboard.
3. **Akses `/login` saat sudah Login**: Buka `/login` saat cookie valid -> Berhasil ter-redirect ke `/admin`.
4. **Token Expired / Tampered**: Masukkan token sembarang pada cookie -> Buka `/admin` -> Ter-redirect ke `/login?reason=session_expired` dan cookie dibersihkan.
