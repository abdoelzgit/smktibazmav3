"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
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
  const [translateX, setTranslateX] = useState(0);
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
      setTranslateX(nextTranslate);

      const computedIndex = Math.min(
        mitras.length - 1,
        Math.max(0, Math.round(progress * (mitras.length - 1)))
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

  const handleSelectMitra = useCallback((index: number) => {
    setActiveIndex(index);

    if (hijackActive && wrapperRef.current && trackRef.current) {
      const wrapper = wrapperRef.current;
      const track = trackRef.current;
      if (!wrapper || !track) return;

      const targetProgress = mitras.length > 1 ? index / (mitras.length - 1) : 0;
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
                  "absolute inset-0 transition-opacity duration-700 ease-in-out pointer-events-none",
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
          <div className="absolute inset-0 z-[2] bg-gradient-to-r from-[#132B6D]/95 via-[#132B6D]/80 to-[#132B6D]/40 pointer-events-none" />
          <div className="absolute inset-0 z-[2] bg-black/20 pointer-events-none" />
        </div>

        {/* 2. Konten Utama */}
        <div className="relative z-10 mx-auto flex h-full w-full max-w-7xl flex-col justify-between px-4 py-12 sm:px-6 lg:px-8 lg:py-16">

          {/* Header Section (Dynamic Headline & Subheadline) */}
          <div className="mb-6 md:mb-10 pt-14 sm:pt-20 md:pt-28 lg:pt-32">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl font-heading transition-all duration-300">
              {currentMitra.title}
            </h2>
            <p className="mt-3 sm:mt-4 max-w-3xl lg:max-w-4xl text-base text-white/85 sm:text-lg leading-relaxed min-h-[3rem] sm:min-h-[3.5rem] transition-all duration-300">
              {currentMitra.description}
            </p>
          </div>

          {/* Area Kartu Logo Mitra (Full Width Slider) */}
          <div 
            className="w-full"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="overflow-hidden py-4 -my-4 px-1">
              <div
                ref={trackRef}
                className={cn(
                  "flex gap-4 py-4 px-1 items-stretch", 
                  !hijackActive && "overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
                )}
                style={{
                  transform: hijackActive ? `translateX(${translateX}px)` : "none",
                  transition: hijackActive ? "transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)" : undefined,
                }}
              >
                {mitras.map((mitra, index) => {
                  const isActive = activeIndex === index;
                  return (
                    <div
                      key={mitra.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleSelectMitra(index)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleSelectMitra(index);
                        }
                      }}
                      aria-pressed={isActive}
                      className={cn(
                        "group relative flex items-center justify-center p-4 sm:p-5 md:p-6 rounded-2xl border transition-all duration-500 ease-out min-w-[200px] sm:min-w-[240px] md:min-w-[280px] h-28 sm:h-32 md:h-36 snap-start cursor-pointer select-none",
                        isActive
                          ? "bg-white border-white shadow-2xl scale-[1.04] opacity-100"
                          : "bg-white/10 border-white/20 hover:bg-white/20 backdrop-blur-md opacity-60 hover:opacity-95"
                      )}
                    >
                      <div className="relative w-full h-full flex items-center justify-center">
                        <Image
                          src={logoError[mitra.id] ? FALLBACK_LOGO : mitra.logo}
                          alt={`Logo ${mitra.title}`}
                          width={260}
                          height={90}
                          unoptimized
                          onError={() => setLogoError(prev => ({ ...prev, [mitra.id]: true }))}
                          className={cn(
                            "w-auto h-auto max-h-16 sm:max-h-20 md:max-h-24 max-w-[90%] object-contain transition-transform duration-300",
                            isActive ? "scale-105" : "group-hover:scale-105"
                          )}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}