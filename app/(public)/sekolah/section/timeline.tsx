"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
// 1. Import komponen BlurFade dari UI kamu
import { BlurFade } from "@/components/ui/blur-fade"; 

export type TimelineSlide = {
  id: string;
  year: string;
  description: string;
  image: string;
};

const TIMELINE_SLIDES: TimelineSlide[] = [
  {
    id: "2014",
    year: "2014",
    description:
      "Titik awal perjalanan BAZMA di bidang pendidikan, membuka jalan bagi program-program pemberdayaan yang menjadi cikal bakal berdirinya sekolah.",
    image: "/images/timeline/foto.webp",
  },
  {
    id: "2019",
    year: "2019",
    description:
      "Bermula dari niat tulus seorang dermawan yang mewakafkan tanah senilai 3 miliar rupiah untuk bidang pendidikan. Tanah tersebut diamanahkan kepada BAZMA, yang kemudian tergerak hatinya untuk mewujudkan impian besar: mendirikan sekolah berorientasi pendidikan dan teknologi bagi generasi penerus bangsa.",
    image: "/images/timeline/2019.webp",
  },
  {
    id: "2020",
    year: "2020",
    description:
      "Pembangunan gedung sekolah dimulai, lengkap dengan penyusunan kurikulum berbasis teknologi informasi untuk menyiapkan generasi yang siap bersaing di era digital.",
    image: "/images/timeline/2020.webp",
  },
  {
    id: "2021",
    year: "2021",
    description:
      "SMK TI BAZMA resmi membuka pendaftaran siswa baru angkatan pertama, menandai dimulainya kegiatan belajar mengajar di kampus yang baru.",
    image: "/images/timeline/2021.webp",
  },
  {
    id: "2022",
    year: "2022",
    description:
      "Berbagai fasilitas penunjang pembelajaran ditambahkan, mulai dari laboratorium komputer hingga ruang praktik, untuk mendukung kompetensi siswa secara menyeluruh.",
    image: "/images/timeline/2022.webp",
  },
  {
    id: "2024",
    year: "2024",
    description:
      "SMK TI BAZMA meraih akreditasi A (unggul), sebagai bukti komitmen sekolah dalam melahirkan lulusan yang profesional, berintegritas, dan berakhlak islami.",
    image: "/images/timeline/2024.webp",
  },
  {
    id: "kini",
    year: "Kini",
    description:
      "Terus bertumbuh dengan menghadirkan inovasi baru di bidang teknologi dan pendidikan, termasuk asisten AI untuk membantu siswa dan calon siswa mendapatkan informasi seputar sekolah.",
    image: "/images/timeline/kini.webp",
  },
];

const AUTOPLAY_DURATION = 6;

export default function TimelineCarousel({
  slides = TIMELINE_SLIDES,
}: {
  slides?: TimelineSlide[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHidden, setIsHidden] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const isPaused = isHidden;

  const imageRefs = useRef<Array<HTMLImageElement | null>>([]);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const progressRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const activeIndexRef = useRef(activeIndex);

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

  // --- Progress bar logic ---
  const setBarInstant = useCallback((index: number, filled: boolean) => {
    const el = progressRefs.current[index];
    if (!el) return;
    el.style.transition = "none";
    el.style.transform = filled ? "scaleX(1)" : "scaleX(0)";
  }, []);

  const startBarCountdown = useCallback((index: number, ms: number) => {
    const el = progressRefs.current[index];
    if (!el || ms <= 0) return;
    void el.offsetWidth;
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

  const prevActiveIndexRef = useRef<number | null>(null);
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const isNewSlide = prevActiveIndexRef.current !== activeIndex;
    prevActiveIndexRef.current = activeIndex;

    if (isNewSlide) {
      progressRefs.current.forEach((_, i) => setBarInstant(i, false));
      remainingMsRef.current = AUTOPLAY_DURATION * 1000;
    } else if (isPaused) {
      const elapsed = Date.now() - slideStartedAtRef.current;
      remainingMsRef.current = Math.max(0, remainingMsRef.current - elapsed);
      freezeBar(activeIndex);
      return;
    }

    if (isPaused) return;

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
  }, [activeIndex, isPaused, goNext, setBarInstant, startBarCountdown, freezeBar]);

  const activeSlide = slides[activeIndex];

  return (
    <section
      data-nav-theme="dark"
      className="relative flex min-h-[520px] w-full flex-col overflow-hidden bg-[#132B6D] text-white sm:min-h-[600px]"
      aria-roledescription="carousel"
      aria-label="Perjalanan sejarah"
    >
      <div className="relative w-full flex-1 overflow-hidden">
        {/* 
           2. MODIFIKASI DI SINI:
           Membungkus Image dengan BlurFade. 
           Kita gunakan inView={false} agar animasi blur hanya dikontrol oleh GSAP opacity/scale,
           bukan oleh scroll viewport. Ini mencegah konflik antara motion/react dan GSAP.
        */}
        {slides.map((slide, i) => (
          <BlurFade
            key={slide.id}
            inView={false} 
            blur="12px" 
            duration={0.8}
            className="absolute inset-0"
          >
            <Image
              ref={(el) => {
                imageRefs.current[i] = el;
              }}
              src={slide.image}
              alt={`Dokumentasi tahun ${slide.year}`}
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover"
              style={{ opacity: i === 0 ? 1 : 0 }}
              aria-hidden={i !== activeIndex}
            />
          </BlurFade>
        ))}

        {/* Wash biru navy */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0b1f5c]/95 via-[#0b1f5c]/70 to-[#0b1f5c]/10 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b1f5c]/40 via-transparent to-[#0b1f5c]/80 pointer-events-none" />

        {/* Konten */}
        <div className="absolute inset-0 z-10 mx-auto flex w-full max-w-[1920px] flex-col justify-between gap-10 px-6 pb-6 pt-10 sm:px-10 sm:pb-8 sm:pt-14 lg:px-16 xl:px-24">
          <div ref={contentRef} className="flex max-w-2xl flex-col gap-4">
            <h2
              data-reveal
              className="font-heading text-5xl font-bold leading-none sm:text-6xl lg:text-7xl"
            >
              {activeSlide.year}
            </h2>

            <p
              data-reveal
              className="max-w-xl font-sans text-sm leading-relaxed text-white/85 sm:text-base"
            >
              {activeSlide.description}
            </p>
          </div>

          <nav className="relative z-10" aria-label="Navigasi timeline">
            <ul className="flex">
              {slides.map((slide, i) => {
                const isActive = i === activeIndex;
                return (
                  <li key={slide.id} className="flex-1">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => goToSlide(i)}
                      aria-current={isActive ? "true" : undefined}
                      className="group h-auto w-full flex-col items-start justify-start gap-0 whitespace-normal rounded-none px-2 text-left hover:bg-transparent sm:px-4"
                    >
                      <span
                        className={cn(
                          "block text-sm font-semibold tracking-wide transition-colors duration-300 sm:text-base",
                          isActive
                            ? "text-white"
                            : "text-white/45 group-hover:text-white/70"
                        )}
                      >
                        {slide.year}
                      </span>

                      <span className="mt-3 block h-[1px] w-full bg-white/15">
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