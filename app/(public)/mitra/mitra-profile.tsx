"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { ArrowUpRight, ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Mitra {
  id: number;
  title: string;
  logo: string;
  description: string;
  image: string;
  url: string;
}

const mitras: Mitra[] = [
  {
    id: 1,
    title: "Pertamina Hulu Rokan",
    logo: "/images/mitra/pertamina-hulu-rokan.webp?v=transparan",
    description: "Subholding Upstream Pertamina yang mengelola wilayah kerja migas strategis di Blok Rokan. Berkolaborasi aktif dalam penguatan kompetensi teknologi energi siswa dan penyediaan program beasiswa pendidikan vokasi.",
    image: "/images/mitra/office/hulu-rokan-office.webp",
    url: "https://phr.pertamina.com"
  },
  {
    id: 2,
    title: "Pertamina Patra Niaga",
    logo: "/images/mitra/pertamina-patra-niaga.webp?v=transparan",
    description: "Subholding Commercial & Trading Pertamina yang mengelola rantai pasok dan distribusi energi nasional. Mendukung kurikulum industri terapan, program magang profesional, dan kesiapan karir lulusan.",
    image: "/images/mitra/office/patra-niaga-office.webp",
    url: "https://pertaminapatraniaga.com"
  },
  {
    id: 3,
    title: "Tugu Insurance",
    logo: "/images/mitra/tugu-insurance.webp?v=transparan",
    description: "Perusahaan asuransi umum nasional terkemuka yang menyediakan solusi perlindungan komprehensif bagi kesehatan, keselamatan, dan manajemen risiko seluruh warga sekolah dan aset pendidikan.",
    image: "/images/mitra/office/tugu-insurance-office.webp",
    url: "https://tugu.com"
  },
  {
    id: 4,
    title: "YAKES Pertamina",
    logo: "/images/mitra/yakes-pertamina.webp?v=transparan",
    description: "Yayasan Kesehatan Pertamina yang menghadirkan layanan kesehatan terpadu, pemeriksaan preventif berkala, serta edukasi gaya hidup sehat untuk menunjang kesejahteraan warga sekolah.",
    image: "/images/mitra/office/yakes-office.webp",
    url: "https://yakespertamina.com"
  },
  {
    id: 5,
    title: "Ashnet",
    logo: "/images/mitra/ashnet.webp?v=transparan",
    description: "Penyedia solusi teknologi informasi dan infrastruktur jaringan internet berkecepatan tinggi yang menopang laboratorium komputer dan pengembangan ekosistem digital pembelajaran modern.",
    image: "/images/mitra/office/asnet-office.webp",
    url: "https://ashnet.id"
  },
  {
    id: 6,
    title: "Pertamina Retail",
    logo: "/images/mitra/pertamina-retail.webp?v=transparan",
    description: "Entitas hilir Pertamina di sektor ritel SPBU dan non-fuel. Berperan strategis dalam program pelatihan kewirausahaan siswa, tata kelola bisnis modern, dan pengembangan kemandirian ekonomi.",
    image: "/images/mitra/office/retail-office.webp",
    url: "https://pertaminaretail.com"
  },
];

const FALLBACK_IMAGE = "/images/info-cover.webp";
const FALLBACK_LOGO = "/images/mitra/pertamina.webp";
const SCROLL_DISTANCE_PER_CARD = 200;

export default function MitraProfileFullScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const [logoError, setLogoError] = useState<Record<number, boolean>>({});
  const [isDesktop, setIsDesktop] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number | null>(null);

  const currentMitra = mitras[activeIndex];

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

      const progress = Math.min(1, Math.max(0, -wrapperRect.top / scrollableHeight));
      const maxTranslate = Math.max(0, track.scrollWidth - track.clientWidth);
      const nextTranslate = -progress * maxTranslate;
      
      // Direct DOM mutation instead of setState to avoid re-renders on every scroll tick
      track.style.transform = `translateX(${nextTranslate}px)`;

      const computedIndex = Math.min(
        mitras.length - 1,
        Math.max(0, Math.round(progress * (mitras.length - 1)))
      );

      // Only update React state when active index actually changes
      if (computedIndex !== activeIndex) {
        setActiveIndex(computedIndex);
      }
    });
  }, [hijackActive, activeIndex]);

  useEffect(() => {
    if (!hijackActive) {
      if (trackRef.current) {
        trackRef.current.style.transform = "translateX(0px)";
      }
      return;
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
    };
  }, [hijackActive, handleScroll]);

  const handleSelectMitra = useCallback((index: number) => {
    setActiveIndex(index);

    if (hijackActive && wrapperRef.current && trackRef.current) {
      const wrapper = wrapperRef.current;
      const track = trackRef.current;
      if (!wrapper || !track) return;

      const targetProgress = mitras.length > 1 ? index / (mitras.length - 1) : 0;
      const maxTranslate = Math.max(0, track.scrollWidth - track.clientWidth);
      const nextTranslate = -targetProgress * maxTranslate;
      
      // Direct DOM mutation for smooth manual scroll
      track.style.transform = `translateX(${nextTranslate}px)`;

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
    handleSelectMitra((activeIndex - 1 + mitras.length) % mitras.length);
  }, [activeIndex, handleSelectMitra]);

  const handleNext = useCallback(() => {
    handleSelectMitra((activeIndex + 1) % mitras.length);
  }, [activeIndex, handleSelectMitra]);

  // Auto-slide setiap 6 detik jika seksi sedang terlihat dan kursor tidak sedang hover
  useEffect(() => {
    if (!isInView || isPaused) return;

    const timer = setTimeout(() => {
      const nextIndex = (activeIndex + 1) % mitras.length;
      handleSelectMitra(nextIndex);
    }, 6000);

    return () => {
      clearTimeout(timer);
    };
  }, [isInView, isPaused, activeIndex, handleSelectMitra]);

  // Notify Lenis on hijackActive state change
  useEffect(() => {
    if (!hijackActive && typeof window !== "undefined") {
      const lenisBroadcast = new Event("lenis-resize");
      window.dispatchEvent(lenisBroadcast);
    }
  }, [hijackActive]);

  return (
    <div
      ref={wrapperRef}
      className="relative w-full bg-[#132B6D]"
      style={{
        height: hijackActive
          ? `calc(100vh + ${mitras.length * SCROLL_DISTANCE_PER_CARD}px)`
          : "auto",
      }}
    >
      <section
        id="profil-mitra"
        data-nav-theme="dark"
        className={cn(
          "relative w-full overflow-hidden text-white",
          hijackActive ? "sticky top-0 h-screen flex items-center" : "min-h-screen py-16 sm:py-24 flex flex-col justify-center"
        )}
      >
        {/* 1. Background Image Gedung Perusahaan (Full Screen dengan Pre-rendered Crossfade & Preloading) */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {mitras.map((mitra, index) => {
            const isActive = activeIndex === index;
            const src = imageErrors[mitra.id] ? FALLBACK_IMAGE : mitra.image;
            return (
              <div
                key={mitra.id}
                className={cn(
                  "absolute inset-0 transition-opacity duration-1000 ease-in-out pointer-events-none",
                  isActive ? "opacity-100 z-[1]" : "opacity-0 z-0"
                )}
              >
                <Image
                  src={src}
                  alt={`Gedung ${mitra.title}`}
                  fill
                  priority={index === 0}
                  loading={index <= 2 ? "eager" : "lazy"}
                  quality={80}
                  onError={() => setImageErrors((prev) => ({ ...prev, [mitra.id]: true }))}
                  className="object-cover object-center"
                  sizes="100vw"
                />
              </div>
            );
          })}
          <div className="absolute inset-0 z-[2] bg-gradient-to-t from-[#132B6D]/80 pointer-events-none" />
          <div className="absolute inset-0 z-[2] bg-black/20 pointer-events-none" />
        </div>

        {/* 2. Konten Utama */}
        <div className="relative z-10 mx-auto flex h-full w-full max-w-7xl flex-col justify-between px-4 py-12 sm:px-6 lg:px-8 lg:py-16">

          {/* Header Section (Dynamic Headline & Subheadline) */}
          <div className="mb-6 md:mb-10 pt-14 sm:pt-20 md:pt-28 lg:pt-32">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl font-heading transition-all duration-500 ease-out">
              {currentMitra.title}
            </h2>
            <p className="mt-3 sm:mt-4 max-w-3xl lg:max-w-4xl text-base text-white/85 sm:text-lg leading-relaxed min-h-[3rem] sm:min-h-[3.5rem] transition-all duration-500 ease-out">
              {currentMitra.description}
            </p>
          </div>

          {/* Area Kartu Logo Mitra & Navigasi Panah */}
          <div
            className="w-full flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Track Kartu */}
            <div className="w-full lg:w-3/4 xl:w-4/5">
              <div className="relative overflow-hidden py-4 -my-4 px-1 [mask-image:linear-gradient(to_right,transparent_0%,rgba(0,0,0,0.2)_24px,rgba(0,0,0,0.85)_64px,black_100px,black_calc(100%-100px),rgba(0,0,0,0.85)_calc(100%-64px),rgba(0,0,0,0.2)_calc(100%-24px),transparent_100%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0%,rgba(0,0,0,0.2)_24px,rgba(0,0,0,0.85)_64px,black_100px,black_calc(100%-100px),rgba(0,0,0,0.85)_calc(100%-64px),rgba(0,0,0,0.2)_calc(100%-24px),transparent_100%)]">
                <div
                  ref={trackRef}
                  className={cn(
                    "flex gap-4 py-4 px-1 items-stretch scroll-smooth",
                    !hijackActive && "overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
                  )}
                  style={{
                    transition: hijackActive ? "transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)" : undefined,
                  }}
                >
                  {mitras.map((mitra, index) => {
                    const isActive = activeIndex === index;
                    return (
                      <div
                        key={mitra.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          if (isActive) {
                            window.open(mitra.url, "_blank", "noopener,noreferrer");
                          } else {
                            handleSelectMitra(index);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            if (isActive) {
                              window.open(mitra.url, "_blank", "noopener,noreferrer");
                            } else {
                              handleSelectMitra(index);
                            }
                          }
                        }}
                        aria-pressed={isActive}
                        title={isActive ? `Buka website ${mitra.title}` : `Pilih ${mitra.title}`}
                        className={cn(
                          "group relative flex items-center justify-center p-4 sm:p-5 md:p-6 rounded-2xl border transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] min-w-[200px] sm:min-w-[240px] md:min-w-[280px] h-28 sm:h-32 md:h-36 snap-start cursor-pointer select-none",
                          isActive
                            ? "bg-white border-white shadow-2xl scale-[1.04]"
                            : "bg-white/10 border-white/20 hover:bg-white/20 backdrop-blur-md hover:scale-[1.02]"
                        )}
                      >
                        {/* Arrow Icon ke Website Perusahaan tanpa background bulat */}
                        <a
                          href={mitra.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          title={`Kunjungi website ${mitra.title}`}
                          aria-label={`Buka website ${mitra.title} di tab baru`}
                          className="absolute bottom-3 right-3 z-10 p-0.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        >
                          <ArrowUpRight
                            className={cn(
                              "h-5 w-5 transition-colors duration-300",
                              isActive
                                ? "text-[#132B6D]"
                                : "text-white/80 group-hover:text-white"
                            )}
                          />
                        </a>

                        {/* Logo Mitra yang mengarah ke website perusahaan */}
                        <a
                          href={mitra.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => {
                            if (!isActive) {
                              e.preventDefault();
                              handleSelectMitra(index);
                            }
                          }}
                          className="relative w-full h-full flex items-center justify-center"
                        >
                          <Image
                            src={logoError[mitra.id] ? FALLBACK_LOGO : mitra.logo}
                            alt={`Logo ${mitra.title}`}
                            width={260}
                            height={90}
                            unoptimized
                            onError={() => setLogoError(prev => ({ ...prev, [mitra.id]: true }))}
                            className={cn(
                              "w-auto h-auto max-h-16 sm:max-h-20 md:max-h-24 max-w-[90%] object-contain transition-all duration-300",
                              isActive ? "scale-105 opacity-100" : "opacity-80 group-hover:opacity-100 group-hover:scale-105"
                            )}
                          />
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Navigasi Panah (Prev / Next seperti di Profil Asrama) */}
            <div className="flex items-center justify-between lg:flex-col lg:items-start gap-4 shrink-0 pb-2">
              <span className="text-sm font-medium text-white/60 hidden lg:block">
                Navigasi Mitra
              </span>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Mitra sebelumnya"
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white hover:text-[#132B6D] cursor-pointer active:scale-95"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Mitra berikutnya"
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white hover:text-[#132B6D] cursor-pointer active:scale-95"
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