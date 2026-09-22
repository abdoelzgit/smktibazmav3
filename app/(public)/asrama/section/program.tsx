"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { ArrowUpRight, ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Program {
  id: number;
  title: string;
  description: string;
  image: string;
}

const SCROLL_DISTANCE_PER_CARD = 300;
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
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const [translateX, setTranslateX] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number | null>(null);

  const currentProgram = programs[activeIndex];

  // Deteksi ukuran layar & preferensi reduced motion
  useEffect(() => {
    const mqlDesktop = window.matchMedia("(min-width: 1024px)");
    const mqlMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updateFlags = () => {
      setIsDesktop(mqlDesktop.matches);
      setReducedMotion(mqlMotion.matches);
    };
    updateFlags();

    mqlDesktop.addEventListener("change", updateFlags);
    mqlMotion.addEventListener("change", updateFlags);
    return () => {
      mqlDesktop.removeEventListener("change", updateFlags);
      mqlMotion.removeEventListener("change", updateFlags);
    };
  }, []);

  const hijackActive = isDesktop && !reducedMotion;

  // Deteksi apakah seksi sedang terlihat di viewport
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.15 }
    );

    observer.observe(wrapper);
    return () => observer.disconnect();
  }, []);

  // Logika Scroll Hijack
  const handleScroll = useCallback(() => {
    if (!hijackActive || !wrapperRef.current || !trackRef.current) return;

    if (rafId.current) cancelAnimationFrame(rafId.current);

    rafId.current = requestAnimationFrame(() => {
      const wrapper = wrapperRef.current;
      const track = trackRef.current;
      if (!wrapper || !track) return;

      const wrapperRect = wrapper.getBoundingClientRect();
      const scrollableHeight = wrapper.offsetHeight - window.innerHeight;
      if (scrollableHeight <= 0) return;

      const progress = Math.min(
        1,
        Math.max(0, -wrapperRect.top / scrollableHeight)
      );

      const maxTranslate = Math.max(0, track.scrollWidth - track.clientWidth);
      const nextTranslate = -progress * maxTranslate;
      setTranslateX(nextTranslate);

      // Update active index based on scroll position
      const computedIndex = Math.min(
        programs.length - 1,
        Math.max(0, Math.round(progress * (programs.length - 1)))
      );

      if (computedIndex !== activeIndex) {
        setActiveIndex(computedIndex);
      }
    });
  }, [hijackActive, activeIndex]);

  useEffect(() => {
    if (!hijackActive) {
      setTranslateX(0);
      return;
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [hijackActive, handleScroll]);

  const handleSelectProgram = useCallback((index: number) => {
    setActiveIndex(index);

    if (hijackActive && wrapperRef.current && trackRef.current) {
      const wrapper = wrapperRef.current;
      const track = trackRef.current;
      if (!wrapper || !track) return;

      const targetProgress = programs.length > 1 ? index / (programs.length - 1) : 0;
      const maxTranslate = Math.max(0, track.scrollWidth - track.clientWidth);
      const nextTranslate = -targetProgress * maxTranslate;
      setTranslateX(nextTranslate);

      const scrollableHeight = wrapper.offsetHeight - window.innerHeight;
      const wrapperTop = wrapper.getBoundingClientRect().top + window.scrollY;
      const targetScrollY = wrapperTop + targetProgress * scrollableHeight;

      window.scrollTo({ top: targetScrollY, behavior: "smooth" });
    } else {
      const track = trackRef.current;
      const card = track?.children[index] as HTMLElement | undefined;
      card?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [hijackActive]);

  const handlePrev = useCallback(() => {
    handleSelectProgram((activeIndex - 1 + programs.length) % programs.length);
  }, [activeIndex, handleSelectProgram]);

  const handleNext = useCallback(() => {
    handleSelectProgram((activeIndex + 1) % programs.length);
  }, [activeIndex, handleSelectProgram]);

  // Auto-slide setiap 6 detik jika seksi sedang terlihat dan kursor tidak sedang hover
  useEffect(() => {
    if (!isInView || isPaused) return;

    const timer = setTimeout(() => {
      const nextIndex = (activeIndex + 1) % programs.length;
      handleSelectProgram(nextIndex);
    }, 6000);

    return () => {
      clearTimeout(timer);
    };
  }, [isInView, isPaused, activeIndex, handleSelectProgram]);

  return (
    // Wrapper tinggi extra untuk scroll hijack di desktop
    <div
      ref={wrapperRef}
      className="relative w-full bg-[#132B6D]"
      style={{
        height: hijackActive
          ? `calc(100vh + ${programs.length * SCROLL_DISTANCE_PER_CARD}px)`
          : "auto",
      }}
    >
      {/* Section Utama: Sticky Full Screen */}
      <section
        id="program-asrama"
        data-nav-theme="dark"
        className={cn(
          "relative w-full overflow-hidden text-white",
          hijackActive ? "sticky top-0 h-screen flex items-center" : "min-h-screen py-16 sm:py-24 flex flex-col justify-center"
        )}
      >
        {/* 1. Background Image Dinamis (Full Screen dengan Pre-rendered Crossfade & Preloading) */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {programs.map((prog, index) => {
            const isActive = activeIndex === index;
            const src = imageErrors[prog.id] ? FALLBACK_IMAGE : prog.image;
            return (
              <div
                key={prog.id}
                className={cn(
                  "absolute inset-0 transition-opacity duration-1000 ease-in-out pointer-events-none",
                  isActive ? "opacity-100 z-[1]" : "opacity-0 z-0"
                )}
              >
                <Image
                  src={src}
                  alt={`Program ${prog.title}`}
                  fill
                  priority={index === 0}
                  loading={index <= 2 ? "eager" : "lazy"}
                  quality={80}
                  onError={() => setImageErrors((prev) => ({ ...prev, [prog.id]: true }))}
                  className="object-cover object-center"
                  sizes="100vw"
                />
              </div>
            );
          })}
          {/* Overlay Gelap Gradasi agar teks terbaca */}
          <div className="absolute inset-0 z-[2] bg-gradient-to-t from-[#132B6D]/95 via-[#132B6D]/80 to-[#132B6D]/40 pointer-events-none" />
          <div className="absolute inset-0 z-[2] bg-black/20 pointer-events-none" />
        </div>

        {/* 2. Konten Utama */}
        <div className="relative z-10 mx-auto flex h-full w-full max-w-7xl flex-col justify-between px-4 py-12 sm:px-6 lg:px-8 lg:py-16">

          {/* Header Section (Diberi padding top agar posisi headline & subheadline turun dan tidak tertutup navbar) */}
          <div className="mb-6 md:mb-10 pt-14 sm:pt-20 md:pt-28 lg:pt-32">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl font-heading transition-all duration-500 ease-out">
              {currentProgram.title}
            </h2>
            <p className="mt-3 sm:mt-4 max-w-3xl lg:max-w-4xl text-base text-white/85 sm:text-lg leading-relaxed min-h-[3rem] sm:min-h-[3.5rem] transition-all duration-500 ease-out">
              {currentProgram.description}
            </p>
          </div>

          {/* Area Kartu Program (Slider) & Navigasi Panah */}
          <div
            className="w-full flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Track Kartu (Diberi py-4 -my-4 px-1 agar efek scale-105 pada kartu aktif tidak terpotong di atas/bawah) */}
            <div className="w-full lg:w-3/4 xl:w-4/5">
              <div className="relative overflow-hidden py-4 -my-4 px-1 [mask-image:linear-gradient(to_right,transparent_0%,rgba(0,0,0,0.2)_24px,rgba(0,0,0,0.85)_64px,black_100px,black_calc(100%-100px),rgba(0,0,0,0.85)_calc(100%-64px),rgba(0,0,0,0.2)_calc(100%-24px),transparent_100%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0%,rgba(0,0,0,0.2)_24px,rgba(0,0,0,0.85)_64px,black_100px,black_calc(100%-100px),rgba(0,0,0,0.85)_calc(100%-64px),rgba(0,0,0,0.2)_calc(100%-24px),transparent_100%)]">
                <div
                  ref={trackRef}
                  className={cn(
                    "flex gap-4 py-4 px-1 items-stretch scroll-smooth",
                    !hijackActive && "overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
                  )}
                  style={{
                    transform: hijackActive ? `translateX(${translateX}px)` : "none",
                    transition: hijackActive ? "transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)" : undefined,
                  }}
                >
                  {programs.map((prog, index) => {
                    const isActive = activeIndex === index;
                    return (
                      <button
                        key={prog.id}
                        type="button"
                        onClick={() => handleSelectProgram(index)}
                        aria-pressed={isActive}
                        className={cn(
                          "group relative flex flex-col justify-between p-6 rounded-2xl border transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] min-w-[280px] sm:min-w-[320px] snap-start text-left cursor-pointer select-none",
                          isActive
                            ? "bg-white text-[#132B6D] border-white shadow-2xl scale-[1.04]"
                            : "bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-xs hover:scale-[1.02]"
                        )}
                      >
                        <div>
                          <h3 className="text-xl font-bold font-heading mb-2">
                            {prog.title}
                          </h3>
                          <div
                            className={cn(
                              "h-1 w-12 rounded-full mb-4 transition-colors duration-300",
                              isActive ? "bg-[#132B6D]" : "bg-white/50"
                            )}
                          />
                          <p
                            className={cn(
                              "text-sm leading-relaxed transition-colors duration-300",
                              isActive ? "text-slate-700" : "text-white/80"
                            )}
                          >
                            {prog.description}
                          </p>
                        </div>

                        <div className="mt-6 flex justify-end">
                          <ArrowUpRight
                            className={cn(
                              "h-6 w-6 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5",
                              isActive ? "text-[#132B6D]" : "text-white"
                            )}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Navigasi Panah */}
            <div className="flex items-center justify-between lg:flex-col lg:items-start gap-4 shrink-0 pb-2">
              <span className="text-sm font-medium text-white/60 hidden lg:block">
                Navigasi Program
              </span>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Program sebelumnya"
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-xs transition-colors hover:bg-white hover:text-[#132B6D] cursor-pointer active:scale-95"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Program berikutnya"
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-xs transition-colors hover:bg-white hover:text-[#132B6D] cursor-pointer active:scale-95"
                >
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}