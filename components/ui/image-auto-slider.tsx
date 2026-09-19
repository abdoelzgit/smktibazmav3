"use client";

import React, { useRef, useEffect } from "react";

interface ImageAutoSliderProps {
  itemCount?: number;
  logos?: string[];
}

export function ImageAutoSlider({ itemCount = 8, logos }: ImageAutoSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const items = logos 
    ? logos 
    : [
        "pertamina.webp",
        "pertamina-hulu-rokan.webp",
        "pertamina-patra-niaga.webp",
        "pertamina-retail.webp",
        "pertalife-insurance.webp",
        "tugu-insurance.webp",
        "yakes-pertamina.webp",
        "ptc.webp",
        "shared-service.webp",
        "ashnet.webp",
      ];

  const duplicatedItems = [...items, ...items];

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleMouseEnter = () => {
      const animations = el.getAnimations();
      animations.forEach((anim) => {
        anim.playbackRate = 0.3; // Perlambat menjadi 30% kecepatan normal
      });
    };

    const handleMouseLeave = () => {
      const animations = el.getAnimations();
      animations.forEach((anim) => {
        anim.playbackRate = 1; // Kembali ke kecepatan normal
      });
    };

    el.addEventListener("mouseenter", handleMouseEnter);
    el.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      el.removeEventListener("mouseenter", handleMouseEnter);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <>
      <style>{`
        @keyframes scroll-right {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .infinite-scroll {
          animation: scroll-right 30s linear infinite;
        }
      `}</style>

      <div className="w-full relative overflow-hidden flex items-center justify-center py-12 bg-white">
        <div className="relative z-10 w-full flex items-center justify-center">
          <div className="w-full max-w-7xl">
            <div
              ref={scrollRef}
              // Gap diperkecil lagi menjadi gap-2 md:gap-4 agar lebih rapat
              className="infinite-scroll flex gap-2 md:gap-4 w-max"
            >
              {duplicatedItems.map((logoFile, index) => (
                <div
                  key={`${logoFile}-${index}`}
                  className="flex-shrink-0 w-64 h-32 md:w-80 md:h-40 lg:w-96 lg:h-48 rounded-xl overflow-hidden bg-white flex items-center justify-center p-6"
                >
                  <img
                    src={`/images/mitra/${logoFile}`}
                    alt={`Logo Mitra ${index + 1}`}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute top-0 left-0 z-20 h-full w-32 md:w-80 pointer-events-none bg-gradient-to-r from-white via-white/90 to-transparent" />

        <div className="absolute top-0 right-0 z-20 h-full w-32 md:w-80 pointer-events-none bg-gradient-to-l from-white via-white/90 to-transparent" />
      </div>
    </>
  );
}