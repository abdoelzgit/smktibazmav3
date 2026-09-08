"use client"

import Image from "next/image"

interface HeroProps {
  title: string
  backgroundImage: string
  /** Teks breadcrumb kecil di atas judul, opsional — mis. "Tentang Kami / Profil Sekolah" */
  eyebrow?: string
}

export function Hero({ title, backgroundImage, eyebrow }: HeroProps) {
  return (
    <section
      data-nav-theme="dark"
      className="relative flex h-[340px] w-full items-end overflow-hidden sm:h-[380px] md:h-[420px] lg:h-[460px]"
    >
      {/* Background image */}
      <Image
        src={backgroundImage}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      {/* Gradient overlay — gelap & pekat dari kiri, menipis ke kanan */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a1a3d]/95 via-[#0a1a3d]/55 to-[#0a1a3d]/10" />
      {/* Gradient tambahan dari bawah supaya judul tetap kontras */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a1a3d]/80 via-transparent to-transparent" />

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-[1920px] px-6 pb-8 sm:px-10 sm:pb-10 md:pb-12 lg:px-16 xl:px-24">
        {eyebrow && (
          <p className="mb-2 font-mono text-xs font-semibold uppercase tracking-widest text-white/70">
            {eyebrow}
          </p>
        )}
        <h1 className="font-sans text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
          {title}
        </h1>
      </div>
    </section>
  )
}