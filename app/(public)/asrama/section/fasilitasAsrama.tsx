"use client";

import React, { useState } from "react";

const facilities = [
  {
    title: "Kamar Santri",
    image: "/images/fasilitas/kamar-santri.webp",
    fallback: "/images/foto.webp",
  },
  {
    title: "Masjid Asrama",
    image: "/images/fasilitas/masjid.webp",
    fallback: "/images/info-cover.webp",
  },
  {
    title: "Ruang Makan & Dapur",
    image: "/images/fasilitas/ruang-makan.webp",
    fallback: "/images/foto.webp",
  },
  {
    title: "Ruang Belajar Mandiri",
    image: "/images/fasilitas/i.webp",
    fallback: "/images/fasilitas/i.webp",
  },
  {
    title: "Lapangan Olahraga",
    image: "/images/fasilitas/lapangan.webp",
    fallback: "/images/info-cover.webp",
  },
  {
    title: "Area Cuci & Sanitasi",
    image: "/images/fasilitas/laundry.webp",
    fallback: "/images/foto.webp",
  },
];

interface FacilityItem {
  title: string;
  image: string;
  fallback?: string;
}

interface FacilityCardProps {
  item: FacilityItem;
}

function FacilityCard({ item }: FacilityCardProps) {
  const [imgSrc, setImgSrc] = useState(item.image);

  return (
    <div className="group relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-100 shadow-sm">
      {/* Gambar: Zoom in halus saat hover */}
      <img
        src={imgSrc}
        alt={item.title}
        loading="lazy"
        onError={() => {
          if (item.fallback && imgSrc !== item.fallback) {
            setImgSrc(item.fallback);
          }
        }}
        className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-110"
      />

      {/* Overlay: Dari transparan ke gelap pekat untuk fokus pada teks */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-500 group-hover:opacity-90" />

      {/* Teks: Fade up dari bawah, muncul bersamaan dengan overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 transition-all duration-500 ease-out">
        <p className="text-base font-semibold text-white drop-shadow-md sm:text-lg">
          {item.title}
        </p>
      </div>
    </div>
  );
}

export default function FasilitasAsrama() {
  return (
    <section className="relative w-full bg-white px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-6xl w-full">
        <div className="mb-10 grid grid-cols-1 gap-6 md:mb-12 md:grid-cols-12 md:gap-10 sm:mb-12">
          <div className="md:col-span-4">
            <h2 className="text-2xl font-bold text-[#132B6D] sm:text-3xl font-heading">
              Fasilitas Asrama
            </h2>
          </div>
          <div className="md:col-span-8">
            <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
              Asrama SMK TI BAZMA dilengkapi berbagai sarana dan fasilitas yang
              bersih, nyaman, dan representatif untuk menunjang pembentukan karakter,
              ibadah, istirahat, serta pembinaan kemandirian santri selama 24 jam.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {facilities.map((item, index) => (
            <FacilityCard key={`${item.title}-${index}`} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
