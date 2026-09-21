"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

interface Program {
  id: number;
  title: string;
  description: string;
  image: string;
}

const programs: Program[] = [
  {
    id: 1,
    title: "Sholat Jenazah",
    description:
      "Mengasah kepedulian dan pengamalan fardhu kifayah melalui salat jenazah masyarakat.",
    image: "/images/program-asrama/sholat-jenazah.jpg",
  },
  {
    id: 2,
    title: "Tasmih",
    description:
      "Menumbuhkan kedisiplinan dan keistiqamahan dalam menjaga hafalan Al-Qur'an.",
    image: "/images/foto.webp",
  },
  {
    id: 3,
    title: "Qori",
    description:
      "Membina siswa agar fasih melantunkan ayat suci Al-Qur'an dengan indah.",
    image: "/images/program-asrama/qori.jpg",
  },
  {
    id: 4,
    title: "Tahfidz",
    description:
      "Menghafal Al-Qur'an secara bertahap dengan target yang terukur.",
    image: "/images/program-asrama/tahfidz.jpg",
  },
  {
    id: 5,
    title: "Tahsin",
    description:
      "Melatih bacaan sesuai kaidah tajwid agar tilawah lebih baik.",
    image: "/images/program-asrama/tahsin.jpg",
  },
  {
    id: 6,
    title: "Kitab",
    description:
      "Mendalami ilmu agama melalui tafsir, ibadah, akhlak, dan tajwid.",
    image: "/images/program-asrama/kitab.jpg",
  },
  {
    id: 7,
    title: "Hadroh",
    description: "Menyalurkan kecintaan pada Islam lewat seni rebana.",
    image: "/images/program-asrama/hadroh.jpg",
  },
  {
    id: 8,
    title: "Pelatihan Adzan, Imam, Khotib",
    description: "Melatih siswa menjadi pemimpin ibadah dan dakwah.",
    image: "/images/program-asrama/pelatihan-adzan.jpg",
  },
  {
    id: 9,
    title: "Muhadoroh",
    description:
      "Melatih keberanian dan kemampuan berbicara di depan umum.",
    image: "/images/program-asrama/muhadoroh.jpg",
  },
  {
    id: 10,
    title: "Puasa Senin & Kamis",
    description:
      "Melatih kedisiplinan dan ketakwaan melalui ibadah sunnah Rasulullah SAW.",
    image: "/images/program-asrama/puasa-sunnah.jpg",
  },
];

const FALLBACK_IMAGE = "/images/info-cover.webp";

export default function ProgramAsramaFullScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<boolean[]>(() =>
    programs.map(() => false)
  );

  const prefersReducedMotion = useReducedMotion();

  const sectionRef = useRef<HTMLElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const progressRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const activeIndexRef = useRef(0);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

  const currentProgram = programs[activeIndex];

  const handleImageError = useCallback((index: number) => {
    setImageErrors((prev) => {
      if (prev[index]) return prev;

      const next = [...prev];
      next[index] = true;
      return next;
    });
  }, []);

  // Horizontal scroll mengikuti scroll vertikal halaman.
  useEffect(() => {
    const section = sectionRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;

    if (!section || !viewport || !track || programs.length <= 1) {
      return;
    }

    // Jarak geser horizontal aktual (dipakai untuk posisi akhir track).
    const getTrackDistance = () =>
      Math.max(0, track.scrollWidth - viewport.clientWidth);

    // Tinggi/panjang area pin (scroll vertikal) SENGAJA dipisah dari lebar
    // track. Kalau dipatok sama dengan getTrackDistance(), area pin jadi
    // pendek karena card cuma ~300px lebar. Di sini dipakai kelipatan tinggi
    // layar per program, jadi area scroll terasa cukup "tinggi" untuk
    // dijelajahi, terlepas dari seberapa lebar card-nya. GSAP scrub tetap
    // memetakan progress 0-1 scroll ke progress 0-1 animasi, jadi posisi
    // akhir card tetap tepat walau jaraknya beda dari getTrackDistance().
    const getPinDistance = () => {
      const isMobile = window.innerWidth < 768;
      const perProgram = window.innerHeight * (isMobile ? 0.85 : 1.15);
      return Math.max(1, programs.length - 1) * perProgram;
    };

    const updateActiveIndex = (progress: number) => {
      const nextIndex = Math.min(
        programs.length - 1,
        Math.floor(progress * programs.length)
      );

      if (nextIndex !== activeIndexRef.current) {
        activeIndexRef.current = nextIndex;
        setActiveIndex(nextIndex);
      }

      // Progress bar menunjukkan perkembangan scroll tiap program.
      const overallProgress = progress * programs.length;

      progressRefs.current.forEach((bar, index) => {
        if (!bar) return;

        const barProgress = Math.max(
          0,
          Math.min(1, overallProgress - index)
        );

        gsap.set(bar, {
          scaleX: barProgress,
        });
      });
    };

    const ctx = gsap.context(() => {
      const tween = gsap.to(track, {
        x: () => -getTrackDistance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${getPinDistance()}`,
          pin: true,
          scrub: prefersReducedMotion ? false : 1,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            updateActiveIndex(self.progress);
          },
        },
      });

      scrollTriggerRef.current =
        tween.scrollTrigger as ScrollTrigger | null;
    }, section);

    const handleResize = () => {
      ScrollTrigger.refresh();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      scrollTriggerRef.current = null;
      ctx.revert();
    };
  }, [prefersReducedMotion]);

  // Klik card atau navigasi untuk menuju posisi scroll program tersebut.
  const goToProgram = useCallback((index: number) => {
    const trigger = scrollTriggerRef.current;
    if (!trigger) return;

    const clampedIndex = Math.max(
      0,
      Math.min(index, programs.length - 1)
    );

    const progress =
      clampedIndex / (programs.length - 1);

    const targetScroll =
      trigger.start + (trigger.end - trigger.start) * progress;

    window.scrollTo({
      top: targetScroll,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }, [prefersReducedMotion]);

  return (
    <section
      ref={sectionRef}
      id="program-asrama"
      data-nav-theme="dark"
      className="relative flex min-h-screen w-full flex-col justify-center overflow-hidden bg-[#132B6D] py-12 text-white sm:py-16"
      aria-roledescription="carousel"
      aria-label="Program Asrama"
    >
      {/* Background images dengan crossfade */}
      <div className="absolute inset-0">
        {programs.map((program, index) => (
          <div
            key={program.id}
            className="absolute inset-0 transition-opacity duration-700 ease-in-out"
            style={{
              opacity: index === activeIndex ? 1 : 0,
            }}
            aria-hidden={index !== activeIndex}
          >
            <Image
              src={
                imageErrors[index]
                  ? FALLBACK_IMAGE
                  : program.image
              }
              alt={program.title}
              fill
              priority={index === 0}
              onError={() => handleImageError(index)}
              className="object-cover"
              sizes="100vw"
            />
          </div>
        ))}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#132B6D]/95 via-[#132B6D]/80 to-[#132B6D]/40" />
        <div className="pointer-events-none absolute inset-0 bg-black/20" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-7xl flex-col px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-10 shrink-0 md:mb-14">
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Program Asrama
          </h2>

          <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base lg:text-lg">
            Kegiatan rutin dan pembinaan karakter yang membentuk
            kepribadian santri yang berakhlak mulia, mandiri, dan siap
            memimpin.
          </p>
        </header>

        {/* Program aktif */}
        <div className="mb-8 min-h-[150px] max-w-2xl sm:mb-10">
          <span className="mb-3 block text-xs font-semibold tracking-[0.25em] text-white/60">
            PROGRAM {String(activeIndex + 1).padStart(2, "0")} /{" "}
            {String(programs.length).padStart(2, "0")}
          </span>

          <h3
            key={`title-${currentProgram.id}`}
            className="animate-in fade-in slide-in-from-bottom-3 duration-500 font-heading text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl"
          >
            {currentProgram.title}
          </h3>

          <p
            key={`description-${currentProgram.id}`}
            className="mt-4 max-w-xl animate-in fade-in duration-700 text-sm leading-relaxed text-white/85 sm:text-base"
          >
            {currentProgram.description}
          </p>
        </div>

        {/* Horizontal scroll track */}
        <div
          ref={viewportRef}
          className="relative -mx-4 overflow-hidden px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
        >
          <div
            ref={trackRef}
            className="flex w-max items-stretch gap-4 py-5 will-change-transform sm:gap-6"
          >
            {programs.map((program, index) => {
              const isActive = activeIndex === index;

              return (
                <button
                  key={program.id}
                  ref={(el) => {
                    cardRefs.current[index] = el;
                  }}
                  type="button"
                  onClick={() => goToProgram(index)}
                  aria-pressed={isActive}
                  className={cn(
                    "relative flex h-[210px] w-[260px] shrink-0 flex-col justify-between rounded-2xl border p-5 text-left transition-all duration-300 sm:h-[240px] sm:w-[310px] sm:p-6",
                    isActive
                      ? "scale-[1.03] border-white bg-white text-[#132B6D] shadow-2xl"
                      : "border-white/25 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
                  )}
                >
                  <div>
                    <span
                      className={cn(
                        "mb-4 block text-xs font-semibold tracking-[0.2em]",
                        isActive
                          ? "text-[#132B6D]/50"
                          : "text-white/50"
                      )}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <h4 className="font-heading text-xl font-bold leading-snug sm:text-2xl">
                      {program.title}
                    </h4>
                  </div>

                  <div>
                    <div
                      className={cn(
                        "mb-3 h-1 w-12 rounded-full",
                        isActive
                          ? "bg-[#132B6D]"
                          : "bg-white/50"
                      )}
                    />

                    <span
                      className={cn(
                        "text-xs font-medium",
                        isActive
                          ? "text-[#132B6D]/60"
                          : "text-white/60"
                      )}
                    >
                      {isActive
                        ? "Sedang ditampilkan"
                        : "Program Asrama"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigasi program dan progress */}
        <nav
          className="mt-auto pt-8"
          aria-label="Navigasi program asrama"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-medium text-white/60">
              Scroll untuk menjelajahi program
            </span>

            <span className="text-xs tabular-nums text-white/60">
              {String(activeIndex + 1).padStart(2, "0")} /{" "}
              {String(programs.length).padStart(2, "0")}
            </span>
          </div>

          <ul className="grid grid-cols-5 gap-x-1 gap-y-3 sm:grid-cols-10">
            {programs.map((program, index) => {
              const isActive = activeIndex === index;

              return (
                <li key={program.id} className="min-w-0">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => goToProgram(index)}
                    aria-current={isActive ? "step" : undefined}
                    className="group h-auto w-full flex-col items-start justify-start gap-0 rounded-none px-1 py-1 text-left hover:bg-transparent sm:px-2"
                  >
                    <span
                      className={cn(
                        "mb-2 line-clamp-2 min-h-8 w-full text-left text-[10px] font-semibold leading-snug transition-colors sm:text-xs",
                        isActive
                          ? "text-white"
                          : "text-white/45 group-hover:text-white/80"
                      )}
                    >
                      {program.title}
                    </span>

                    <span className="block h-[2px] w-full overflow-hidden bg-white/20">
                      <span
                        ref={(el) => {
                          progressRefs.current[index] = el;
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
    </section>
  );
}