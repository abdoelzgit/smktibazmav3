<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md — Smktibazmav3 Project Guidelines

## Overview
**Smktibazmav3** adalah aplikasi web resmi SMK TI BAZMA yang dibangun menggunakan **Next.js (App Router)** dengan **Server Actions** sebagai penanganan utama logika backend & mutasi data.

---

## Tech Stack & Ecosystem
- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS v4 + tw-animate-css + class-variance-authority (`cva`)
- **UI Components**: Shadcn UI (`components/ui`), `@base-ui/react`, `lucide-react`
- **Animations & Smooth Scroll**: Framer Motion (`framer-motion` / `motion`), GSAP (`@gsap/react`), Lenis (`lenis`)
- **Backend Architecture**: Next.js **Server Actions** (`'use server'`)

---

## Architecture & Directory Conventions

```
smktibazmav3/
├── app/                  # Next.js App Router (Pages, Layouts, Route Groups)
│   ├── admin/            # Dashboard & Manajemen Admin
│   ├── actions/          # Server Actions untuk backend & mutasi data
│   ├── layout.tsx        # Root layout
│   ├── globals.css       # Global styles & import Tailwind v4
│   └── page.tsx          # Landing page
├── components/           # UI Components
│   ├── ui/               # Komponen Shadcn UI (Button, Input, Card, dsb.)
│   └── ...               # Komponen reusable umum (Navbar, Footer, Hero, dsb.)
├── lib/                  # Utilities, Helper functions, API/Database clients
│   └── utils.ts          # Utility `cn()` (clsx + tailwind-merge)
├── public/               # Static Assets (Gambar, Logo, Icon)
└── AGENTS.md             # Dokumen panduan & konteks instruksi untuk AI Agent
```

---

## Backend & Server Actions Standard Rules

1. **Penggunaan Server Actions**:
   - Semua fungsi backend, integrasi database, fetch data khusus backend, dan mutasi data (CRUD) **WAJIB** menggunakan **Next.js Server Actions** (`'use server'`).
   - Tempatkan Server Actions di folder `actions/` atau `app/actions/` (misal: `actions/berita.ts`, `actions/sekolah.ts`) atau berdekatan dengan fitur terkait.

2. **Format Response Server Actions**:
   - Kembalikan tipe data terspesifikasi (type-safe) dengan struktur standar:
     ```typescript
     export type ActionResult<T = unknown> = {
       success: boolean;
       data?: T;
       error?: string;
     };
     ```

3. **Validasi & Error Handling**:
   - Selalu lakukan validasi data input pada Server Action menggunakan Zod atau pengecekan tipe strict sebelum memproses data.
   - Jangan biarkan uncaught error terekspos langsung ke frontend; tangkap error menggunakan `try...catch` dan kembalikan `{ success: false, error: "Pesan error" }`.

4. **Revalidasi Data Cache**:
   - Setelah mutasi data berhasil (create, update, delete), gunakan `revalidatePath()` atau `revalidateTag()` dari `next/cache` untuk memastikan cache Next.js diperbarui di UI.

---

## Frontend & Client Component Rules

1. **Server vs Client Components**:
   - Secara default, gunakan **Server Components** untuk performa render optimal & SEO.
   - Gunakan directive `'use client'` HANYA pada komponen yang memerlukan state (`useState`), event listener (`onClick`, `onChange`), browser API, atau animasi/hooks (GSAP, Framer Motion, Lenis).

2. **Styling & UI Standards**:
   - Gunakan utility classes Tailwind CSS v4.
   - Manfaatkan helper `cn()` dari `@/lib/utils` untuk penggabungan class kondisional.
   - Hindari inline style atau CSS kustom tanpa alasa spesifik.

3. **Animasi & Interaktivitas**:
   - Gunakan `framer-motion` / `motion` atau `gsap` untuk interaksi dan animasi UI modern.
   - Pastikan animasi bersifat smooth, responsive, dan tidak memberatkan performa render.

---

## Agent Behavioral Guidelines

- **Bahasa**: Gunakan Bahasa Indonesia atau Bahasa Inggris secara jelas dalam penjelasan dan dokumentasi.
- **Type Safety**: Terapkan TypeScript strict mode. Hindari penggunaan tipe `any`.
- **Clean Code**: Jaga komponen agar modular, reusable, dan terpisah antara logika presentation (UI) dan logika backend (Server Action).
- **Integritas Aturan Auto-Generated**: Jangan pernah menghapus blok `<!-- BEGIN:nextjs-agent-rules --> ... <!-- END:nextjs-agent-rules -->` yang ada di bagian atas file `AGENTS.md`.

<!-- antislop:start -->
## antislop
For UI, copy, people, mobile layout, or code comments work, load the antislop skill for the task:
- Core filter, always on: `antislop`
- Copy & text: `antislop-copywriting`
- UI / visual: `antislop-ui`
- People: `antislop-human`
- Mobile / responsive: `antislop-layoutmobile`
- Code comments: `antislop-code`
Before starting, ask the user when antislop applies: during the work, or after it is done.
<!-- antislop:end -->
