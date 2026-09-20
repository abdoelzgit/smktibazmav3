# Implementation Plan - Optimization & Scroll Overflow Fixes

Rencana ini dibuat untuk menangani dua masalah utama pada aplikasi web **SMK TI BAZMA**:
1. **Performa Menurun / Memory Leak saat aplikasi dibuka lama**: Disebabkan oleh akumulasi event listener, animasi GSAP ticker yang tidak di-kill saat unmount, interval timer yang belum dibersihkan, dan re-render berlebih pada beberapa komponen client.
2. **Bug Scroll / Overflow tidak mencapai Footer saat berpindah halaman**: Disebabkan oleh `Lenis` smooth scroll yang tidak melakukan *re-calculation* tinggi halaman (`lenis.resize()`) dan *scroll position reset* (`lenis.scrollTo(0, { immediate: true })`) saat rute Next.js berganti atau gambar lazily loaded selesai dimuat.

---

## User Review Required

> [!IMPORTANT]
> - **Penanganan Lenis Smooth Scroll**: Semua rute halaman publik akan dikoneksikan ke event sinkronisasi `usePathname()` sehingga setiap perpindahan halaman secara otomatis mereset scroll ke koordinat `(0, 0)` dan menghitung ulang total tinggi dokumen hingga `Footer`.
> - **Pembersihan GSAP & Event Listeners**: Semua GSAP timeline, ScrollTrigger, dan event listener browser (`resize`, `scroll`, `matchMedia`) akan ditambahkan fungsi pembersihan (*cleanup function*) pada `useEffect` unmount.

---

## Open Questions

> [!NOTE]
> Tidak ada pertanyaan tertunda yang menghambat. Pendekatan perbaikan bersifat komprehensif dan tidak merubah desain visual atau fitur yang sudah ada.

---

## Proposed Changes

---

### Core Infrastructure & Smooth Scroll

#### [MODIFY] [smooth-scroll.tsx](file:///c:/Users/Hp/OneDrive/Documents/bdeul/code/smktibazmav3/components/smooth-scroll.tsx)
- Menambahkan listener `usePathname()` untuk mendeteksi perubahan rute halaman secara otomatis.
- Saat rute berganti (`pathname` berubah):
  - Memanggil `lenis.scrollTo(0, { immediate: true })` agar posisi scroll kembali ke paling atas tanpa delay.
  - Memanggil `lenis.resize()` dan `ScrollTrigger.refresh()` dalam `requestAnimationFrame` ganda untuk memperhitungkan ulang tinggi DOM hingga `Footer` halaman baru.
- Menambahkan `ResizeObserver` pada dokumen publik `#public-page-content` untuk secara otomatis memperbarui tinggi scroll Lenis saat gambar atau komponen dinamis selesai dimuat.

---

### Navigation & Transitions

#### [MODIFY] [navbar.tsx](file:///c:/Users/Hp/OneDrive/Documents/bdeul/code/smktibazmav3/components/navbar.tsx)
- Memperbaiki GSAP warning `[GSAP] Target not found` pada `dots` array di drawer menu ketika target array kosong.
- Membersihkan GSAP timeline `drawerOpenTlRef` dan `drawerCloseTlRef` saat komponen unmount untuk mencegah memory leak.
- Menambahkan debouncing / `requestAnimationFrame` pada listener scroll `getActiveTheme` agar tidak membebankan CPU saat pengguna melakukan scrolling cepat.

#### [MODIFY] [portal-overlay.tsx](file:///c:/Users/Hp/OneDrive/Documents/bdeul/code/smktibazmav3/components/portal-transition/portal-overlay.tsx)
- Memastikan animasi GSAP `scrambleInto` `rafIdRef` dan GSAP timeline dibersihkan (*killed*) sepenuhnya ketika transisi dibatalkan atau selesai.

---

### Page Components & Performance Optimization

#### [MODIFY] [mitra-profile.tsx](file:///c:/Users/Hp/OneDrive/Documents/bdeul/code/smktibazmav3/app/(public)/mitra/mitra-profile.tsx)
- Memastikan `IntersectionObserver` dan `requestAnimationFrame` scroll-hijack dibersihkan dengan benar saat meninggalkan halaman `/mitra`.
- Memperhitungkan tinggi kontainer `wrapperRef` secara responsif dan memanggil `lenis.resize()` saat state `hijackActive` berubah.

#### [MODIFY] [curtain-slider.tsx](file:///c:/Users/Hp/OneDrive/Documents/bdeul/code/smktibazmav3/components/curtain-slider/curtain-slider.tsx)
- Menambahkan cleanup eksplisit pada `setInterval` auto-slide untuk menghindari penumpukan timer saat pengguna berpindah halaman.

---

## Verification Plan

### Automated Tests
- Menjalankan pemeriksaan linter dan TypeScript strict check:
  ```bash
  powershell -ExecutionPolicy Bypass -Command "npx tsc --noEmit"
  ```

### Manual Verification
1. **Navigasi Rute & Reachability Footer**:
   - Membuka halaman panjang seperti `/sekolah` atau `/mitra`, scroll ke bagian tengah/bawah, lalu berpindah ke halaman lain seperti `/berita` atau `/jejak-karya`.
   - Memastikan scroll langsung mereset ke paling atas `(0, 0)` dan scroll dapat menjangkau paling bawah hingga `Footer` 100% tanpa terhenti (*truncated*).
2. **Uji Ketahanan & Memory Leak**:
   - Membuka dev tools `Performance` / `Memory` tab.
   - Melakukan navigasi antar halaman secara berulang (15–20 kali) dan mendiamkan aplikasi selama beberapa menit.
   - Memastikan penggunaan memori JavaScript (Heap Size) tetap stabil dan CPU usage turun mendekati 0% saat diam.
