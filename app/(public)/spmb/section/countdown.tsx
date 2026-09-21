"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export type CountdownSectionProps = {
  title?: string;
  targetDate?: string; // Format ISO string e.g. "2026-11-15T00:00:00"
  backgroundImage?: string;
};

// Tanggal target pendaftaran SPMB (konfigurasi default yang mudah diubah)
const DEFAULT_TARGET_DATE = "2026-11-15T00:00:00";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
};

function calculateTimeLeft(target: string): TimeLeft {
  const difference = +new Date(target) - +new Date();

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    isExpired: false,
  };
}

export default function CountdownSection({
  title = "Countdown SPMB",
  targetDate = DEFAULT_TARGET_DATE,
  backgroundImage = "/images/info-cover.webp",
}: CountdownSectionProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setTimeLeft(calculateTimeLeft(targetDate));

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const padZero = (num: number) => String(num).padStart(2, "0");

  return (
    <section aria-label="Countdown SPMB" className="w-full bg-white py-12 sm:py-16 lg:py-20">
      <div className="mx-auto w-full max-w-[1920px] px-6 sm:px-10 lg:px-16 xl:px-24">
        {/* Banner Horizontal Utama */}
        <div className="relative min-h-[220px] sm:min-h-[260px] lg:min-h-[300px] w-full overflow-hidden rounded-2xl sm:rounded-3xl shadow-xl flex items-center justify-center">
          {/* Background Image */}
          <Image
            src={backgroundImage}
            alt="Kegiatan Siswa SMK TI BAZMA"
            fill
            sizes="100vw"
            className="object-cover object-center"
            priority
          />

          {/* Overlay Gelap Navy */}
          <div className="absolute inset-0 bg-[#132B6D]/85 bg-gradient-to-r from-[#132B6D]/95 via-[#1E3A8A]/85 to-[#132B6D]/95" />

          {/* Konten Teks & Timer */}
          <div className="relative z-10 flex flex-col items-center justify-center p-6 sm:p-10 text-center text-white">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white mb-4 sm:mb-6">
              {title}
            </h2>

            {/* Formatting Single-Row Countdown without number boxes */}
            {isMounted ? (
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-wider font-mono text-white drop-shadow-md">
                  <span>{padZero(timeLeft.days)}</span>
                  <span className="mx-1 sm:mx-2.5 text-white/80 animate-pulse">:</span>
                  <span>{padZero(timeLeft.hours)}</span>
                  <span className="mx-1 sm:mx-2.5 text-white/80 animate-pulse">:</span>
                  <span>{padZero(timeLeft.minutes)}</span>
                  <span className="mx-1 sm:mx-2.5 text-white/80 animate-pulse">:</span>
                  <span>{padZero(timeLeft.seconds)}</span>
                </div>

                {/* Sub-label unit waktu ringkas */}
                <div className="mt-2 flex w-full justify-between max-w-[280px] sm:max-w-[420px] md:max-w-[500px] lg:max-w-[580px] text-[10px] sm:text-xs font-medium uppercase tracking-widest text-white/70 px-1">
                  <span className="w-1/4 text-center">Hari</span>
                  <span className="w-1/4 text-center">Jam</span>
                  <span className="w-1/4 text-center">Menit</span>
                  <span className="w-1/4 text-center">Detik</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-wider font-mono text-white/50">
                00 : 00 : 00 : 00
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
