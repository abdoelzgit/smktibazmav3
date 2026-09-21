"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PortalLink } from "@/components/portal-transition";

/**
 * ---------------------------------------------------------------------------
 * DATA
 * ---------------------------------------------------------------------------
 * Ganti `image` dengan path gambar asli kamu (taruh di folder /public/images/).
 */
export type Slide = {
  id: string;
  tabLabel: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  image: string;
};

const SLIDES: Slide[] = [
  {
    id: "integrasi-bisnis-hilir",
    tabLabel: "ENERGI MASA DEPAN INDONESIA",
    title: "Energi Masa Depan Indonesia!",
    description:
      "Kami percaya, masa depan bangsa ada di tangan generasi muda yang cerdas dan berakhlak. SMK TI BAZMA hadir untuk melahirkan talenta teknologi yang siap jadi motor penggerak Indonesia.",
    ctaLabel: "Selengkapnya",
    ctaHref: "#",
    image: "/images/caro4.webp",
  },
  {
    id: "melayani-sepenuh-hati",
    tabLabel: "KUALITAS TERUJI, DEDIKASI TANPA HENTI",
    title: "Kualitas Teruji, Dedikasi Tiada Henti",
    description:
      'Terakreditasi A (unggul), SMK TI BAZMA berkomitmen melahirkan lulusan profesional, berintegritas, dan berakhlak islami..',
    ctaLabel: "Selengkapnya",
    ctaHref: "#",
    image: "/images/caro1.webp",
  },
  {
    id: "kilang-dan-petrokimia",
    tabLabel: "LANGKAH KECIL, KARYA BESAR",
    title: "Langkah Kecil, Karya Besar",
    description:
      "SMK TI BAZMA mendorong siswa untuk berinovasi melalui berbagai karya seperti pembuatan project website, desain poster, majalah digital, dan beragam karya kreatif lainnya.",
    ctaLabel: "Selengkapnya",
    ctaHref: "#",
    image: "/images/caro3.webp",
  },
  {
    id: "maritim-logistik-terintegrasi",
    tabLabel: "ASISTEN AI SIAP MEMBANTUMU",
    title: "Asisten AI Siap Membantumu",
    description:
      "Dapatkan kemudahan dalam mencari informasi terkait pendaftaran siswa baru, informasi akademik, dan kegiatan sekolah lainnya melalui asisten AI yang selalu siap membantu.",
    ctaLabel: "Selengkapnya",
    ctaHref: "#",
    image: "/images/caro2.webp",
  },
];

const AUTOPLAY_DURATION = 6; // detik per slide - juga durasi penuh countdown bar

export default function HeroCarousel({
  slides = SLIDES,
}: {
  slides?: Slide[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHidden, setIsHidden] = useState(false);
  // Respect prefers-reduced-motion: skip Ken Burns + reveal animations
  const prefersReducedMotion = useReducedMotion();

  // Catatan: pause-on-hover SUDAH DIHAPUS dengan sengaja. Sebelumnya
  // carousel ini pause saat kursor berada di atas section hero (yang
  // tingginya nyaris satu layar penuh), sehingga dari sudut pandang
  // user terasa "macet" begitu mouse mendekat/bergerak di area atas
  // halaman. Satu-satunya kondisi yang masih boleh menghentikan
  // countdown adalah saat tab benar-benar disembunyikan (mis. pindah
  // tab / minimize), supaya timer tidak "kebablasan" maju sendiri saat
  // halaman lama tidak terlihat.
  const isPaused = isHidden;

  // Ref sekarang menyimpan elemen <img> di balik next/image (Next.js
  // forward ref ke elemen img asli), bukan lagi div biasa - dipakai GSAP
  // untuk animasi crossfade + Ken Burns yang sama seperti sebelumnya.
  const imageRefs = useRef<Array<HTMLImageElement | null>>([]);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const progressRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const activeIndexRef = useRef(activeIndex);

  // --- Autoplay: hanya menjadwalkan goNext, tidak lagi punya
  // tanggung jawab apa pun terhadap bar. Tetap clock-based (bukan rAF)
  // supaya jadwal tetap akurat walau tab lama di-background.
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const slideStartedAtRef = useRef<number>(0);
  const remainingMsRef = useRef<number>(AUTOPLAY_DURATION * 1000);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    const handleVisibilityChange = () => setIsHidden(document.hidden);
    const handlePageShow = () => setIsHidden(document.hidden);

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pageshow", handlePageShow);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);

  const goToSlide = useCallback(
    (nextIndex: number) => {
      const total = slides.length;
      const normalized = ((nextIndex % total) + total) % total;
      if (normalized === activeIndexRef.current) return;
      setActiveIndex(normalized);
    },
    [slides.length]
  );

  const goNext = useCallback(() => {
    goToSlide(activeIndexRef.current + 1);
  }, [goToSlide]);

  // --- Crossfade + Ken Burns pada background image, dan reveal teks ---
  // prefers-reduced-motion: skip Ken Burns scale & staggered reveal,
  // tetap jalankan crossfade opacity (perubahan konten tetap jelas)
  useEffect(() => {
    const currentImage = imageRefs.current[activeIndex];
    const otherImages = imageRefs.current.filter((_, i) => i !== activeIndex);

    const tl = gsap.timeline();

    tl.to(
      otherImages,
      {
        opacity: 0,
        duration: prefersReducedMotion ? 0 : 0.7,
        ease: "power2.inOut",
      },
      0
    );

    if (currentImage) {
      gsap.killTweensOf(currentImage);
      if (prefersReducedMotion) {
        // Reduced motion: langsung tampilkan tanpa scale
        gsap.set(currentImage, { opacity: 1, scale: 1 });
      } else {
        tl.fromTo(
          currentImage,
          { opacity: 0, scale: 1.08 },
          {
            opacity: 1,
            scale: 1,
            duration: 1,
            ease: "power2.out",
          },
          0
        ).to(
          currentImage,
          {
            scale: 1.06,
            duration: AUTOPLAY_DURATION + 1,
            ease: "none",
          },
          0
        );
      }
    }

    if (contentRef.current) {
      const children = contentRef.current.querySelectorAll("[data-reveal]");
      gsap.killTweensOf(children);
      if (prefersReducedMotion) {
        // Reduced motion: langsung tampilkan tanpa slide-up
        gsap.set(children, { y: 0, opacity: 1 });
      } else {
        tl.fromTo(
          children,
          { y: 24, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: "power3.out",
            stagger: 0.08,
          },
          0.15
        );
      }
    }

    return () => {
      tl.kill();
    };
  }, [activeIndex, prefersReducedMotion]);

  // --- Progress bar sebagai COUNTDOWN autoplay ---
  // Bar tab aktif mengisi 0 -> 1 selama AUTOPLAY_DURATION, sinkron persis
  // dengan waktu sampai auto-advance berikutnya. Bar tab lain selalu diam
  // di 0 (hanya satu bar yang pernah "hidup").
  const setBarInstant = useCallback((index: number, filled: boolean) => {
    const el = progressRefs.current[index];
    if (!el) return;
    el.style.transition = "none";
    el.style.transform = filled ? "scaleX(1)" : "scaleX(0)";
  }, []);

  const startBarCountdown = useCallback((index: number, ms: number) => {
    const el = progressRefs.current[index];
    if (!el || ms <= 0) return;
    void el.offsetWidth; // force reflow sebelum transition baru
    el.style.transition = `transform ${ms}ms linear`;
    el.style.transform = "scaleX(1)";
  }, []);

  const freezeBar = useCallback((index: number) => {
    const el = progressRefs.current[index];
    if (!el) return;
    const computed = window.getComputedStyle(el).transform;
    el.style.transition = "none";
    el.style.transform = computed === "none" ? "scaleX(0)" : computed;
  }, []);

  // --- Satu-satunya pemilik timeoutRef ---
  // Sengaja DIGABUNG jadi satu efek (bukan dua efek terpisah untuk
  // "ganti slide" dan "pause/resume") yang sama-sama menulis ke
  // timeoutRef yang sama. Dua efek independen yang berbagi ref mutable
  // rawan menyisakan timer "bocor" (terjadwal lalu lupa dibatalkan) saat
  // keduanya terpicu berdekatan - misalnya di React Strict Mode (dev)
  // yang me-mount efek dua kali, atau saat activeIndex dan isPaused
  // berubah nyaris bersamaan. Timer bocor itu bisa memicu goNext() di
  // saat yang tidak seharusnya, lalu membuat autoplay kehilangan jadwal
  // berikutnya sampai halaman di-refresh. Dengan satu efek, HANYA ada
  // satu tempat yang pernah membuat setTimeout, dan baris pertama efek
  // selalu membatalkan timer sebelumnya lebih dulu - tidak mungkin ada
  // yang tersisa tanpa pemilik.
  const prevActiveIndexRef = useRef<number | null>(null);
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const isNewSlide = prevActiveIndexRef.current !== activeIndex;
    prevActiveIndexRef.current = activeIndex;

    if (isNewSlide) {
      // Slide berganti (auto atau klik manual): reset total - semua bar
      // kosong, hitung mundur mulai dari durasi penuh lagi.
      progressRefs.current.forEach((_, i) => setBarInstant(i, false));
      remainingMsRef.current = AUTOPLAY_DURATION * 1000;
    } else if (isPaused) {
      // Bukan slide baru, tapi baru saja di-pause (tab disembunyikan):
      // bekukan sisa waktu & bar persis di posisi sekarang, jangan
      // jadwalkan apa pun.
      const elapsed = Date.now() - slideStartedAtRef.current;
      remainingMsRef.current = Math.max(0, remainingMsRef.current - elapsed);
      freezeBar(activeIndex);
      return;
    }

    if (isPaused) {
      // Slide baru tapi langsung dalam kondisi paused (tab disembunyikan
      // tepat saat slide berganti): bar tetap di 0, tunggu sampai
      // benar-benar resume.
      return;
    }

    // Resume, atau slide baru & tidak sedang paused: mulai/lanjutkan
    // countdown dari remainingMsRef saat ini.
    if (remainingMsRef.current <= 0) {
      remainingMsRef.current = AUTOPLAY_DURATION * 1000;
    }
    slideStartedAtRef.current = Date.now();
    startBarCountdown(activeIndex, remainingMsRef.current);
    timeoutRef.current = setTimeout(() => {
      goNext();
    }, remainingMsRef.current);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, isPaused, goNext]);

  const activeSlide = slides[activeIndex];

  return (
    <section
      data-nav-theme="dark"
      className="relative flex min-h-screen min-h-[100svh] w-full flex-col overflow-hidden bg-primary text-white"
      aria-roledescription="carousel"
      aria-label="Sorotan utama"
    >
      <div className="relative min-h-[420px] w-full flex-1 overflow-hidden">
        {slides.map((slide, i) => (
          <Image
            key={slide.id}
            ref={(el) => {
              imageRefs.current[i] = el;
            }}
            src={slide.image}
            alt={slide.title}
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover"
            style={{ opacity: i === 0 ? 1 : 0 }}
            aria-hidden={i !== activeIndex}
          />
        ))}

        {/* Overlay gradient: dari bawah ke atas pada mobile, dari kiri ke kanan pada desktop */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/85 to-transparent md:bg-gradient-to-r md:from-primary md:via-primary/90 md:to-transparent" />


        {/*
          Wrapper ini yang menentukan posisi & lebar blok teks + nav:
          - `mx-auto max-w-[1920px]` menahan konten supaya tidak nempel ke
            tepi kiri layar di monitor ultra-lebar (2K/4K).
          - `justify-end` + `pb-*` mendorong seluruh blok (teks + nav) ke
            bagian bawah area hero, meniru pola hero Pertamina asli.
          - `gap-10` memberi jarak antara blok teks dan baris nav tab.
        */}
        <div className="absolute inset-0 z-10 mx-auto flex w-full max-w-[1920px] flex-col justify-end gap-6 sm:gap-8 md:gap-10 px-5 sm:px-8 md:px-10 lg:px-16 xl:px-24 pb-7 sm:pb-8 md:pb-10 lg:pb-10 xl:pb-10">
          <div ref={contentRef} className="flex max-w-2xl flex-col gap-3.5 sm:gap-4">
            <h1
              data-reveal
              className="font-heading text-3xl font-bold leading-[1.1] sm:text-4xl md:text-5xl lg:text-5xl text-balance"
            >
              {activeSlide.title}
            </h1>

            <p
              data-reveal
              className="max-w-xl font-sans text-xs leading-relaxed text-white/85 sm:text-sm line-clamp-3 sm:line-clamp-none"
            >
              {activeSlide.description}
            </p>

            <div data-reveal>
              {/*
                CTA sekarang pakai shadcn Button (asChild -> merender
                sebagai <a>, bukan <button>, supaya tetap navigable link).
                Visual pill-outline lama dipertahankan lewat className;
                variant="outline" cuma dipakai sebagai basis (border,
                focus-ring, disabled state) yang konsisten dengan
                komponen shadcn lain nantinya.
              */}
              <PortalLink
                href={activeSlide.ctaHref}
                label={activeSlide.tabLabel || activeSlide.title || "SMK TI BAZMA"}
                className="group inline-flex h-auto w-fit items-center gap-2 rounded-full border border-white/70 bg-transparent px-5 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm font-semibold text-white transition-colors hover:bg-white hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary cursor-pointer"
              >
                {activeSlide.ctaLabel}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                >
                  <path
                    d="M3 11L11 3M11 3H4M11 3V10"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </PortalLink>
            </div>
          </div>

          <nav className="relative z-10 w-full" aria-label="Navigasi carousel">
            {/* Header label ringkas khusus mobile */}
            <div className="text-[11px] font-semibold tracking-wider text-white/90 mb-2 px-0.5 md:hidden">
              <span className="truncate block uppercase font-medium text-white/80">{activeSlide.tabLabel}</span>
            </div>

            <ul className="flex gap-1.5 sm:gap-2 md:gap-0">
              {slides.map((slide, i) => {
                const isActive = i === activeIndex;
                return (
                  <li key={slide.id} className="flex-1">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => goToSlide(i)}
                      aria-current={isActive ? "true" : undefined}
                      className="group h-auto w-full flex-col items-start justify-start gap-0 whitespace-normal rounded-none px-0.5 sm:px-1 md:px-4 py-1.5 md:py-0 text-left hover:bg-transparent cursor-pointer"
                    >
                      <span
                        className={cn(
                          "hidden md:block text-[11px] font-semibold tracking-wide transition-colors duration-300 sm:text-xs",
                          isActive
                            ? "text-white"
                            : "text-white/40 group-hover:text-white/70"
                        )}
                      >
                        {slide.tabLabel}
                      </span>

                      <span className="mt-0 md:mt-3 block h-[3px] md:h-[1px] w-full rounded-full overflow-hidden bg-white/25 md:bg-white/10">
                        <span
                          ref={(el) => {
                            progressRefs.current[i] = el;
                          }}
                          className="block h-full w-full origin-left bg-gradient-to-r from-lime-400 to-emerald-400"
                          style={{ transform: "scaleX(0)" }}
                        />
                      </span>
                    </Button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>
    </section>
  );
}
