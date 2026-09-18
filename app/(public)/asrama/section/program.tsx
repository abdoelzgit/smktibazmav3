"use client";

import React, { useState } from "react";
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
  {
    id: 1,
    title: "Hadroh",
    description: "Melatih siswa bermain rebana dan seni vokal islami, menumbuhkan kekompakan tim serta apresiasi budaya religi.",
    image: "/images/kepsekbg.webp",
  },
  {
    id: 2,
    title: "Qori",
    description: "Membina kemampuan tilawah Al-Qur'an dengan tajwid dan lagu yang benar, dibimbing langsung oleh ustadz/ustadzah.",
    image: "/images/program-asrama/qori.jpg",
  },
  {
    id: 3,
    title: "Tahfiz",
    description: "Program hafalan Al-Qur'an terstruktur dengan target juz per semester, didampingi murobbi tahfiz berpengalaman.",
    image: "/images/program-asrama/tahfiz.jpg",
  },
];

const FALLBACK_IMAGE = "/images/foto.webp";

export default function ProgramAsrama() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  const currentProgram = programs[activeIndex];
  const currentImage = imageError ? FALLBACK_IMAGE : currentProgram.image;

  const handleSelectProgram = (index: number) => {
    setActiveIndex(index);
    setImageError(false); // reset error state tiap ganti program
  };

  const handlePrev = () => {
    handleSelectProgram((activeIndex - 1 + programs.length) % programs.length);
  };

  const handleNext = () => {
    handleSelectProgram((activeIndex + 1) % programs.length);
  };

  return (
    <section
      id="program-asrama"
      data-nav-theme="light"
      className="relative w-full bg-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-6xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Kolom Kiri: Gambar */}
          <div className="lg:col-span-5 w-full">
            <div className="relative aspect-[4/3] sm:aspect-[1/1] lg:aspect-[4/5] w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-slate-100 shadow-sm">
              {/* key={activeIndex} memaksa remount tiap ganti program, biar transisi fade jalan beneran */}
              <Image
                key={activeIndex}
                src={currentImage}
                alt={currentProgram.title}
                fill
                onError={() => setImageError(true)}
                className="object-cover animate-in fade-in duration-500"
                sizes="(max-width: 1024px) 100vw, 40vw"
                priority
              />
            </div>
          </div>

          {/* Kolom Kanan */}
          <div className="lg:col-span-7 w-full flex flex-col justify-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#132B6D] font-heading mb-6 sm:mb-8">
              Program Asrama
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
              {programs.map((prog, index) => {
                const isActive = activeIndex === index;

                return (
                  <button
                    key={prog.id}
                    type="button"
                    onClick={() => handleSelectProgram(index)}
                    aria-pressed={isActive}
                    className={cn(
                      "group relative flex flex-col justify-between text-left p-5 sm:p-6 rounded-2xl transition-all duration-300 min-h-[190px] sm:min-h-[220px] cursor-pointer",
                      isActive
                        ? "bg-[#132B6D] text-white shadow-md border border-[#132B6D]"
                        : "bg-white text-slate-900 border border-slate-200 hover:border-slate-300"
                    )}
                  >
                    <div>
                      <h3
                        className={cn(
                          "text-lg sm:text-xl font-bold font-heading",
                          isActive ? "text-white" : "text-slate-900"
                        )}
                      >
                        {prog.title}
                      </h3>
                      <p
                        className={cn(
                          "mt-2 text-xs sm:text-sm leading-relaxed",
                          isActive ? "text-white/80" : "text-slate-500"
                        )}
                      >
                        {prog.description}
                      </p>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <div
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                          isActive
                            ? "text-white"
                            : "text-slate-400 group-hover:text-slate-700"
                        )}
                      >
                        <ArrowUpRight className="h-5 w-5" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 sm:mt-8 flex items-center gap-3">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Program sebelumnya"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition-colors duration-200 hover:border-[#132B6D] hover:bg-[#132B6D] hover:text-white"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Program berikutnya"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition-colors duration-200 hover:border-[#132B6D] hover:bg-[#132B6D] hover:text-white"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}