import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

type ProgramHeroProps = {
  /** Gambar latar (foto yang relevan dengan jurusan) */
  imageSrc: string
  imageAlt: string
  /** Judul besar jurusan, contoh: "Sistem Informasi, Jaringan & Aplikasi (SIJA)" */
  title: string
  /** Label kecil di kiri bawah, contoh: "Profil Jurusan" */
  label: string
  /** Paragraf deskripsi di kanan bawah */
  description: string
  /** Tombol CTA */
  ctaLabel?: string
  ctaHref?: string
  /**
   * Class tambahan untuk elemen <section> root — pakai ini untuk
   * `sticky top-0 z-10` dkk, JANGAN bungkus komponen ini dengan
   * <section> lain (bikin nested section & merusak perhitungan tinggi).
   */
  className?: string
}

export function ProgramHero({
  imageSrc,
  imageAlt,
  title,
  label,
  description,
  ctaLabel = "Lebih lengkap",
  ctaHref = "#",
  className,
}: ProgramHeroProps) {
  return (
    <section
      data-nav-theme="dark"
      className={cn(
        "relative flex min-h-screen w-full flex-col overflow-hidden bg-[#0a0e27]",
        className
      )}
    >
      {/* Background image */}
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />

      {/* Gradient gelap di atas — supaya judul tetap kebaca di atas foto terang */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-transparent" />

      {/* Gradient biru navy di bawah — transisi halus ke section berikutnya */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-b from-transparent via-[#0a0e27]/70 to-[#0a0e27]" />

      {/* Konten */}
      <div className="relative z-10 flex h-full flex-1 flex-col justify-between px-6 pb-10 pt-28 sm:px-10 md:pb-14 md:pt-20 lg:px-16 xl:px-24">
        {/* Judul */}
        <h2 className="w-full font-sans text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl text-balance">
          {title}
        </h2>

        {/* Baris bawah: label kiri + deskripsi & CTA kanan */}
        <div className="mt-16 flex flex-col items-start justify-between gap-8 md:flex-row md:items-start">
          <span className="font-sans text-sm font-medium text-white/80">
            {label}
          </span>

          <div className="max-w-md md:text-right">
            <p className="font-sans text-sm leading-relaxed text-white/85 md:text-base">
              {description}
            </p>
            <Link
              href={ctaHref}
              className="group mt-5 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-colors duration-300 hover:bg-white hover:text-[#0a0e27] md:ml-auto"
            >
              {ctaLabel}
              <ArrowRight
                size={16}
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}