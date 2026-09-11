# SMK TI Bazma

Dokumentasi production untuk project website dan dashboard SMK TI Bazma. Repository ini berisi dua aplikasi Next.js yang dikelola dan dideploy secara terpisah:

- `frontend`: website publik sekolah.
- `backend`: dashboard internal/backend berbasis Next.js.

## Persyaratan

- Node.js 20.9 atau lebih baru.
- npm 10 atau lebih baru.
- Akses ke repository dan platform deployment yang digunakan.

> Versi Node.js harus konsisten antara local, CI, dan production. Gunakan `node --version` dan `npm --version` untuk memeriksa environment.

## Struktur Project

```text
.
├── frontend/       # Website publik
├── backend/        # Dashboard/backend Next.js
├── package.json    # Script pengembangan tingkat repository
└── package-lock.json
```

Setiap aplikasi memiliki `package.json`, `package-lock.json`, konfigurasi Next.js, dan dependency sendiri. Jalankan perintah production dari folder aplikasi yang ingin dirilis.

## Menjalankan Secara Lokal

### Frontend

```bash
npm run dev:frontend
```

Buka `http://localhost:3000`.

### Backend

```bash
npm run dev:backend
```

Jika frontend dan backend dijalankan bersamaan, gunakan port yang berbeda untuk salah satunya. Contoh di PowerShell:


Backend kemudian dapat diakses melalui `http://localhost:3001`.

## Validasi Sebelum Release

Jalankan validasi berikut pada setiap aplikasi yang akan dirilis:

```bash
cd frontend
npm ci
npm run lint
npm run build
```

Ulangi perintah yang sama dari folder `backend` jika backend ikut dirilis. Release hanya boleh dilanjutkan jika `lint` dan `build` selesai tanpa error.

Status verifikasi repository saat dokumentasi ini dibuat:

- Build production `frontend`: berhasil.
- Build production `backend`: berhasil.
- Lint `backend`: berhasil dengan satu warning penggunaan `<img>`.
- Lint `frontend`: masih gagal pada pemeriksaan React Hooks di komponen `multi-level-drawer-menu`; perbaiki error ini sebelum menjadikan lint sebagai gate release.

Build juga menampilkan warning bahwa Next.js mendeteksi beberapa lockfile dan menginfer root workspace dari lockfile root. Ini tidak menggagalkan build, tetapi konfigurasi `turbopack.root` atau strategi lockfile perlu ditetapkan jika warning tersebut ingin dihilangkan.

Preview hasil build production secara lokal:

```bash
cd frontend
npm run start
```

Perintah `npm run start` menjalankan hasil build terakhir. Jalankan `npm run build` terlebih dahulu setelah ada perubahan source.


### Build gagal karena dependency

Pastikan command dijalankan dari folder aplikasi yang benar dan lockfile tidak diabaikan:

```bash
cd frontend  # atau backend
Remove-Item -Recurse -Force node_modules  # PowerShell, bila diperlukan
npm ci
npm run build
```

Di Linux/macOS, gunakan `rm -rf node_modules` sebagai pengganti `Remove-Item`.

## Referensi

- [Next.js Deployment](https://nextjs.org/docs/app/building-your-application/deploying)
- [Next.js Production Checklist](https://nextjs.org/docs/app/building-your-application/deploying/production-checklist)
- [Vercel Documentation](https://vercel.com/docs)
