"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
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

export default function ProgramAsramaFullScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);

  const currentProgram = programs[activeIndex];
  const currentImageSrc = imageError ? FALLBACK_IMAGE : currentProgram.image;

  const handleSelectProgram = (index: number) => {
    setImageError(false);
    setActiveIndex(index);

    const card = trackRef.current?.children[index] as HTMLElement | undefined;
    card?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  return (
    <div className="relative w-full bg-[#132B6D]">
      <section
        id="program-asrama"
        data-nav-theme="dark"
        className="relative w-full overflow-x-hidden text-white min-h-screen py-16 sm:py-24 flex flex-col justify-center"
      >
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            key={currentProgram.id}
            src={currentImageSrc}
            alt={currentProgram.title}
            fill
            priority
            onError={() => setImageError(true)}
            className="object-cover transition-opacity duration-700 ease-in-out"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#132B6D]/95 via-[#132B6D]/80 to-[#132B6D]/40" />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Konten Utama */}
        <div className="relative z-10 mx-auto flex h-full w-full max-w-7xl flex-col justify-between px-4 py-12 sm:px-6 lg:px-8 lg:py-16">

          {/* Header */}
          <div className="mb-8 md:mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl font-heading">
              Program Asrama
            </h2>
            <p className="mt-4 max-w-xl text-base text-white/80 sm:text-lg leading-relaxed">
              Kegiatan rutin dan pembinaan karakter yang membentuk kepribadian santri yang berakhlak mulia, mandiri, dan siap memimpin.
            </p>
          </div>

          {/* Slider */}
          <div className="w-full">
            <div
              ref={trackRef}
              className="flex gap-4 pb-4 px-4 scroll-px-4 overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
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
                      "group relative flex flex-col justify-between p-4 rounded-2xl border transition-all duration-300 min-w-[280px] sm:min-w-[320px] snap-start text-left",
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
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </section>
    </div>
  );
} 