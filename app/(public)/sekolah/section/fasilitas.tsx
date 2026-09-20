"use client"

import React from "react"

const facilities = [
  { title: "Ruang Musik", image: "/images/fasilitas/ruang-musik.jpg" },
  { title: "Ruang BK", image: "/images/fasilitas/ruang-bk.jpg" },
  { title: "Ruang Kelas A", image: "/images/fasilitas/i.webp" },
  { title: "Ruang Kelas B", image: "/images/fasilitas/ruang-kelas-2.jpg" },
  { title: "Ruang Kelas C", image: "/images/fasilitas/ruang-kelas-3.jpg" },
  { title: "Ruang Kelas D", image: "/images/fasilitas/ruang-kelas-4.jpg" },
]

interface FacilityItem {
  title: string
  image: string
}

interface FacilityCardProps {
  item: FacilityItem
}

function FacilityCard({ item }: FacilityCardProps) {
  return (
    <div className="group relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-100">
      {/* Gambar: Zoom in halus saat hover */}
      <img
        src={item.image}
        alt={item.title}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-110"
      />

      {/* Overlay: Dari transparan ke gelap pekat untuk fokus pada teks */}
      <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/60" />

      {/* Teks: Fade up dari bawah, muncul bersamaan dengan overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 translate-y-4 opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100">
        <p className="text-base font-semibold text-white drop-shadow-md sm:text-lg">
          {item.title}
        </p>
      </div>
    </div>
  )
}

export default function Fasilitas() {
  return (
    <section data-nav-theme="light" className="sticky top-0 z-0 min-h-screen w-full bg-white px-4 py-16 sm:px-6 lg:px-8 sm:py-20">
      <div className="mx-auto max-w-6xl w-full">
        <div className="mb-10 grid grid-cols-1 gap-6 md:mb-12 md:grid-cols-12 md:gap-10 sm:mb-12">
          <div className="md:col-span-3">
            <h2 className="text-2xl font-bold text-[#132B6D] sm:text-3xl">
              Fasilitas
            </h2>
          </div>
          <div className="md:col-span-9">
            <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
              SMK TI BAZMA memiliki fasilitas lengkap meliputi ruang kelas modern, laboratorium komputer, dan asrama yang nyaman untuk mendukung proses belajar siswa.
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
  )
}