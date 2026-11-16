import Link from "next/link"
import { ArrowRight, Megaphone } from "lucide-react"
import { AsciiArt } from "@/components/ui/creation-of-adam"

export function SpmbSection() {
  return (
    <section
      data-nav-theme="light"
      className="relative w-full overflow-hidden bg-white pt-16 sm:pt-20 md:pt-24 pb-8 sm:pb-12 border-t border-slate-100"
    >
      {/* ── Konten Teks & CTA (Padded Container) ── */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-8 lg:px-16 text-center">
        {/* Badge */}
    

        {/* Headline */}
        <h2 className="mt-4 sm:mt-6 font-sans text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight text-[#132B6D]">
          SPMB SMK TI BAZMA
          <br />
          <span className="text-blue-600">Tahun Ajaran 2027/2028</span>
        </h2>

        {/* Body */}
        <p className="mx-auto mt-3 sm:mt-5 max-w-xl text-xs sm:text-sm md:text-base leading-relaxed text-slate-600">
          Seleksi Penerimaan Murid Baru SMK TI BAZMA untuk Tahun Ajaran 2027/2028
          resmi dibuka. Pendaftaran dilakukan secara online melalui portal SPMB.
        </p>

        {/* Info cards */}
        <div className="mt-8 sm:mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          <div className="rounded-xl sm:rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4 sm:p-5 text-center shadow-2xs">
            <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Pendaftaran Dibuka
            </p>
            <p className="mt-1 text-base sm:text-lg font-bold text-[#132B6D]">
              16 November 2026
            </p>
          </div>
          <div className="rounded-xl sm:rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4 sm:p-5 text-center shadow-2xs">
            <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Batas Akhir
            </p>
            <p className="mt-1 text-base sm:text-lg font-bold text-[#132B6D]">
              31 Desember 2026
            </p>
          </div>

        </div>

        {/* CTA */}
        <div className="mt-8 sm:mt-10">
          <Link
            href="/spmb"
            className="group inline-flex items-center gap-2 rounded-xl bg-[#132B6D] px-6 py-3 sm:px-7 sm:py-3.5 text-xs sm:text-sm font-semibold text-white transition-all hover:bg-[#0e2159] shadow-md shadow-blue-950/15 hover:shadow-lg hover:shadow-blue-950/20"
          >
            Daftar Sekarang
            <ArrowRight
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
              strokeWidth={2}
            />
          </Link>
        </div>
      </div>

      {/* ── Standalone Fullscreen Edge-to-Edge ASCII Art (Bawah CTA, Light Theme) ── */}
      <div className="relative w-full mt-10 sm:mt-16 overflow-hidden h-[180px] sm:h-[280px] md:h-[380px] lg:h-[480px]">
        <AsciiArt
          className="w-full h-full"
          fit="width"
          theme="light"
          opacity={0.88}
        />
        {/* Subtle top & bottom gradients for seamless edge blending on white bg */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-10 sm:h-16 bg-gradient-to-b from-white to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 sm:h-16 bg-gradient-to-t from-white to-transparent" />
      </div>
    </section>
  )
}
