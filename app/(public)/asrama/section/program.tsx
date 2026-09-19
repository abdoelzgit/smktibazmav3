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

const programs: Program[] = [
  { id: 1, title: "Sholat Jenazah", description: "Mengasah kepedulian dan pengamalan fardhu kifayah melalui salat jenazah masyarakat.", image: "/images/program-asrama/sholat-jenazah.jpg" },
  { id: 2, title: "Tasmih", description: "Menumbuhkan kedisiplinan dan keistiqamahan dalam menjaga hafalan Al-Qur'an.", image: "/images/foto.webp" },
  { id: 3, title: "Qori", description: "Membina siswa agar fasih melantunkan ayat suci Al-Qur'an dengan indah.", image: "/images/program-asrama/qori.jpg" },
  { id: 4, title: "Tahfidz", description: "Menghafal Al-Qur'an secara bertahap dengan target yang terukur.", image: "/images/program-asrama/tahfidz.jpg" },
  { id: 5, title: "Tahsin", description: "Melatih bacaan sesuai kaidah tajwid agar tilawah lebih baik.", image: "/images/program-asrama/tahsin.jpg" },
  { id: 6, title: "Kitab", description: "Mendalami ilmu agama melalui tafsir, ibadah, akhlak, dan tajwid.", image: "/images/program-asrama/kitab.jpg" },
  { id: 7, title: "Hadroh", description: "Menyalurkan kecintaan pada Islam lewat seni rebana.", image: "/images/program-asrama/hadroh.jpg" },
  { id: 8, title: "Pelatihan Adzan, Imam, Khotib", description: "Melatih siswa menjadi pemimpin ibadah dan dakwah.", image: "/images/program-asrama/pelatihan-adzan.jpg" },
  { id: 9, title: "Muhadoroh", description: "Melatih keberanian dan kemampuan berbicara di depan umum.", image: "/images/program-asrama/muhadoroh.jpg" },
  { id: 10, title: "Puasa Senin & Kamis", description: "Melatih kedisiplinan dan ketakwaan melalui ibadah sunnah Rasulullah SAW.", image: "/images/program-asrama/puasa-sunnah.jpg" },
];

const FALLBACK_IMAGE = "/images/info-cover.webp";
// Jarak scroll per card untuk efek hijack di desktop
const SCROLL_DISTANCE_PER_CARD = 200;

export default function ProgramAsramaFullScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [translateX, setTranslateX] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number | null>(null);

  const currentProgram = programs[activeIndex];
  // Gunakan fallback jika gambar error
  const currentImageSrc = imageError ? FALLBACK_IMAGE : currentProgram.image;

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

  // Logika Scroll Hijack (sama seperti sebelumnya)
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

      const maxTranslate = track.scrollWidth - track.clientWidth;
      const nextTranslate = -progress * maxTranslate;
      setTranslateX(nextTranslate);

      // Update active index based on scroll position
      const cardEls = Array.from(track.children) as HTMLElement[];
      if (cardEls.length > 0) {
        let closestIndex = 0;
        let closestDist = Infinity;

        cardEls.forEach((el, idx) => {
          const cardLeftAfterTranslate = el.offsetLeft + nextTranslate;
          // Kita cari kartu yang paling dekat dengan sisi kiri viewport track
          // Karena track digeser negatif, kita hitung jarak absolutnya
          const d = Math.abs(cardLeftAfterTranslate);

          if (d < closestDist) {
            closestDist = d;
            closestIndex = idx;
          }
        });

        // Hanya update jika indeks berubah untuk menghindari re-render berlebihan
        if (closestIndex !== activeIndex) {
          setActiveIndex(closestIndex);
          setImageError(false);
        }
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

  const handleSelectProgram = (index: number) => {
    setImageError(false);
    setActiveIndex(index);

    if (hijackActive && wrapperRef.current && trackRef.current) {
      const wrapper = wrapperRef.current;
      const track = trackRef.current;
      const card = track.children[index] as HTMLElement | undefined;
      if (!card) return;

      const maxTranslate = track.scrollWidth - track.clientWidth;
      const targetProgress = maxTranslate > 0 ? Math.min(1, card.offsetLeft / maxTranslate) : 0;

      const scrollableHeight = wrapper.offsetHeight - window.innerHeight;
      const wrapperTop = wrapper.getBoundingClientRect().top + window.scrollY;
      const targetScrollY = wrapperTop + targetProgress * scrollableHeight;

      window.scrollTo({ top: targetScrollY, behavior: "smooth" });
    } else {
      const track = trackRef.current;
      const card = track?.children[index] as HTMLElement | undefined;
      card?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  };

  const handlePrev = () => {
    handleSelectProgram((activeIndex - 1 + programs.length) % programs.length);
  };

  const handleNext = () => {
    handleSelectProgram((activeIndex + 1) % programs.length);
  };

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
        {/* 1. Background Image Dinamis (Full Screen) */}
        <div className="absolute inset-0 z-0">
          <Image
            key={currentProgram.id} // Key change triggers fade animation
            src={currentImageSrc}
            alt={currentProgram.title}
            fill
            priority
            onError={() => setImageError(true)}
            className="object-cover transition-opacity duration-700 ease-in-out"
            sizes="100vw"
          />
          {/* Overlay Gelap Gradasi agar teks terbaca */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#132B6D]/95 via-[#132B6D]/80 to-[#132B6D]/40" />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* 2. Konten Utama */}
        <div className="relative z-10 mx-auto flex h-full w-full max-w-7xl flex-col justify-between px-4 py-12 sm:px-6 lg:px-8 lg:py-16">

          {/* Header Section */}
          <div className="mb-8 md:mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl font-heading">
              Program Asrama
            </h2>
            <p className="mt-4 max-w-xl text-base text-white/80 sm:text-lg leading-relaxed">
              Kegiatan rutin dan pembinaan karakter yang membentuk kepribadian santri yang berakhlak mulia, mandiri, dan siap memimpin.
            </p>
          </div>

          {/* Area Kartu Program (Slider) */}
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">

            {/* Track Kartu */}
            <div className="w-full lg:w-2/3 xl:w-3/4">
              <div className="overflow-hidden">
                <div
                  ref={trackRef}
                  className={cn(
                    "flex gap-4 pb-4", // pb-4 untuk space scrollbar jika ada
                    !hijackActive && "overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
                  )}
                  style={{
                    transform: hijackActive ? `translateX(${translateX}px)` : "none",
                    transition: hijackActive ? "transform 0.05s linear" : undefined,
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
                          "group relative flex flex-col justify-between p-6 rounded-2xl border transition-all duration-300 min-w-[280px] sm:min-w-[320px] snap-start text-left",
                          isActive
                            ? "bg-white text-[#132B6D] border-white shadow-xl scale-105"
                            : "bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm"
                        )}
                      >
                        <div>
                          <h3 className="text-xl font-bold font-heading mb-2">
                            {prog.title}
                          </h3>
                          <div className={cn("h-1 w-12 rounded-full mb-4", isActive ? "bg-[#132B6D]" : "bg-white/50")} />
                          <p className={cn("text-sm leading-relaxed", isActive ? "text-slate-700" : "text-white/80")}>
                            {prog.description}
                          </p>
                        </div>

                        <div className="mt-6 flex justify-end">
                          <ArrowUpRight className={cn("h-6 w-6", isActive ? "text-[#132B6D]" : "text-white")} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Navigasi Panah (Hanya muncul di Desktop/Layar Besar jika diinginkan, atau selalu muncul) */}
            <div className="flex items-center gap-4 lg:flex-col lg:items-start">
              <span className="text-sm font-medium text-white/60 hidden lg:block">
                Navigasi Program
              </span>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Program sebelumnya"
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white hover:text-[#132B6D]"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Program berikutnya"
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white hover:text-[#132B6D]"
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