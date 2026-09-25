"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export interface GalleryItem {
  image: string;
  title?: string;
  description?: string;
}

export interface ExpandableGalleryProps {
  images: (string | GalleryItem)[];
  className?: string;
  clickable?: boolean;
}

export const ExpandableGallery: React.FC<ExpandableGalleryProps> = ({
  images,
  className = "",
  clickable = true,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isManuallyTapped = useRef<boolean>(false);
  const manualResetTimer = useRef<NodeJS.Timeout | null>(null);

  // Deteksi perangkat layar sentuh / tanpa kursor (hover: none)
  useEffect(() => {
    const checkTouch = () => {
      const isTouch =
        window.matchMedia("(hover: none)").matches ||
        window.matchMedia("(pointer: coarse)").matches ||
        window.innerWidth < 768;
      setIsTouchDevice(isTouch);
    };

    checkTouch();
    window.addEventListener("resize", checkTouch);
    return () => window.removeEventListener("resize", checkTouch);
  }, []);

  // Logika Scroll-driven auto-expand untuk perangkat tanpa kursor
  useEffect(() => {
    if (!isTouchDevice) return;

    let rafId: number;

    const handleScroll = () => {
      if (isManuallyTapped.current) return;
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Cek apakah kontainer sedang berada dalam area pandang (viewport)
      const isInView = rect.top < windowHeight * 0.85 && rect.bottom > windowHeight * 0.15;

      if (isInView) {
        // Titik fokus pengamatan di ~48% tinggi layar
        const focalY = windowHeight * 0.48;
        const relativeY = focalY - rect.top;
        const progress = Math.min(Math.max(relativeY / rect.height, 0), 0.999);

        const targetIndex = Math.floor(progress * images.length);
        setHoveredIndex(targetIndex);
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(handleScroll);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    // Pemicu awal saat pertama dimuat
    handleScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
      if (manualResetTimer.current) clearTimeout(manualResetTimer.current);
    };
  }, [isTouchDevice, images.length]);

  const handleCardInteraction = (index: number) => {
    if (isTouchDevice) {
      setHoveredIndex(index);
      isManuallyTapped.current = true;
      if (manualResetTimer.current) clearTimeout(manualResetTimer.current);
      // Lepaskan mode manual setelah 3.5 detik agar scrolling kembali mengambil alih
      manualResetTimer.current = setTimeout(() => {
        isManuallyTapped.current = false;
      }, 3500);
    }

    if (clickable) {
      openImage(index);
    }
  };

  const openImage = (index: number) => {
    if (!clickable) return;
    setSelectedIndex(index);
  };

  const closeImage = () => {
    setSelectedIndex(null);
  };

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % images.length);
    }
  };

  const goToPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + images.length) % images.length);
    }
  };

  const getFlexValue = (index: number) => {
    if (hoveredIndex === null) {
      return 1;
    }
    return hoveredIndex === index ? 2.4 : 0.72;
  };

  const getImageSrc = (item: string | GalleryItem): string =>
    typeof item === "string" ? item : item.image;

  const getImageTitle = (item: string | GalleryItem, index: number): string =>
    typeof item === "string"
      ? `Gallery image ${index + 1}`
      : item.title || `Gallery image ${index + 1}`;

  return (
    <div className={className}>
      {/* Horizontal / Vertical Expandable Gallery */}
      <div
        ref={containerRef}
        className="flex flex-col sm:flex-row gap-3 sm:gap-3.5 h-[720px] sm:h-[400px] md:h-[460px] lg:h-[500px] w-full"
      >
        {images.map((item, index) => {
          const src = getImageSrc(item);
          const title = getImageTitle(item, index);
          const isObject = typeof item !== "string";
          const isActive = hoveredIndex === index;

          return (
            <motion.div
              key={index}
              className={`relative overflow-hidden rounded-2xl group shadow-lg ${
                clickable ? "cursor-pointer" : "cursor-default select-none"
              }`}
              style={{ flex: 1 }}
              animate={{ flex: getFlexValue(index) }}
              transition={{
                duration: 1.05, // Transisi perlahan & lembut
                ease: [0.25, 1, 0.4, 1], // Soft deceleration curve
              }}
              onMouseEnter={() => !isTouchDevice && setHoveredIndex(index)}
              onMouseLeave={() => !isTouchDevice && setHoveredIndex(null)}
              onClick={() => handleCardInteraction(index)}
            >
              {/* Gambar Latar Belakang */}
              <img
                src={src}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-1200 ease-out group-hover:scale-103"
              />

              {/* Top Vignette Fade */}
              <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/50 via-transparent to-transparent pointer-events-none z-[1]" />

              {/* Deep Bottom Blue Fade Gradient */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-[#132B6D] via-[#132B6D]/80 via-45% to-transparent pointer-events-none z-[2]"
                initial={{ opacity: 0.75 }}
                animate={{ opacity: isActive ? 0.95 : 0.7 }}
                transition={{ duration: 0.9, ease: "easeInOut" }}
              />

              {/* Text Content Area */}
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 lg:p-7 text-white z-10 flex flex-col justify-end pointer-events-none">
                <div className="flex flex-col items-start w-full">
                  {/* Judul Kartu */}
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-white drop-shadow-md leading-snug line-clamp-1 w-full">
                    {title}
                  </h3>

                  {/* Deskripsi Teks dengan transisi halus tanpa lonjakan layout */}
                  {isObject && item.description && (
                    <motion.div
                      initial={false}
                      animate={{
                        opacity: isActive ? 1 : 0,
                        height: isActive ? "auto" : 0,
                        y: isActive ? 0 : 6,
                      }}
                      transition={{
                        duration: 0.55,
                        ease: [0.25, 1, 0.4, 1],
                      }}
                      className="overflow-hidden w-full"
                    >
                      <p className="text-xs sm:text-sm text-white/90 leading-relaxed max-w-xl line-clamp-2 sm:line-clamp-3 drop-shadow-sm pt-1.5 sm:pt-2 font-normal">
                        {item.description}
                      </p>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Expanded View Modal */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
            onClick={closeImage}
          >
            {/* Close Button */}
            <button
              className="absolute top-6 right-6 z-10 p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
              onClick={closeImage}
              aria-label="Tutup"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Previous Button */}
            {images.length > 1 && (
              <button
                className="absolute left-4 sm:left-6 z-10 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
                onClick={goToPrev}
                aria-label="Sebelumnya"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Image Preview & Details */}
            <motion.div
              className="relative max-w-5xl max-h-[85vh] w-full flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.img
                key={selectedIndex}
                src={getImageSrc(images[selectedIndex])}
                alt={getImageTitle(images[selectedIndex], selectedIndex)}
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-xl shadow-2xl"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              />
              {typeof images[selectedIndex] !== "string" && (
                <div className="mt-4 text-center text-white max-w-xl px-4">
                  <h3 className="text-xl sm:text-2xl font-bold">
                    {(images[selectedIndex] as GalleryItem).title}
                  </h3>
                  {(images[selectedIndex] as GalleryItem).description && (
                    <p className="text-sm text-white/75 mt-1">
                      {(images[selectedIndex] as GalleryItem).description}
                    </p>
                  )}
                </div>
              )}
            </motion.div>

            {/* Next Button */}
            {images.length > 1 && (
              <button
                className="absolute right-4 sm:right-6 z-10 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
                onClick={goToNext}
                aria-label="Selanjutnya"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            {/* Image Counter */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-white text-sm bg-white/15 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20">
              {selectedIndex + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Example Usage
export function Component() {
  const images = [
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200&auto=format&fit=crop",
  ];

  return (
    <div className="min-h-screen dark:bg-black bg-white flex items-center justify-center p-8">
      <ExpandableGallery images={images} className="w-3/4 max-w-7xl" />
    </div>
  );
}

export default ExpandableGallery;
