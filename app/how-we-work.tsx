"use client"

import React, { useRef } from "react"
import { motion, useScroll, useTransform, MotionValue } from "framer-motion"

type StepItem = {
  id: number
  stepNumber: string
  title: string
  description: string
}

const stepsData: StepItem[] = [
  {
    id: 1,
    stepNumber: "01",
    title: "Beasiswa Penuh",
    description:
      "SMK TI Bazma memberikan kesempatan belajar bagi siswa berprestasi dari seluruh Indonesia dengan dukungan beasiswa 100% sampai lulus.",
  },
  {
    id: 2,
    stepNumber: "02",
    title: "Kurikulum Terpadu",
    description:
      "Menggabungkan Kurikulum Nasional, Industri, & Islamic Boarding School (Asrama) dalam satu sistem pembelajaran yang unggul & berdaya saing.",
  },
  {
    id: 3,
    stepNumber: "03",
    title: "Fasilitas Lengkap",
    description:
      "Menyediakan asrama, perlengkapan belajar, sarana olahraga, layanan kesehatan, makan-minum, serta transportasi penjemputan dan kepulangan siswa.",
  },
  {
    id: 4,
    stepNumber: "04",
    title: "Program Belajar 4 Tahun",
    description:
      "Fokus pada kompetensi SIJA dengan masa belajar 4 tahun, termasuk 1 tahun khusus untuk Praktek Kerja Industri (Prakerin).",
  },
  {
    id: 5,
    stepNumber: "05",
    title: "Peluang Prakerin",
    description:
      "Bekerja sama dengan BUMN dan industri untuk menyediakan tempat prakerin dan meningkatkan kompetensi profesional siswa.",
  },
  {
    id: 6,
    stepNumber: "06",
    title: "Boarding Berbasis IT",
    description:
      "Membekali siswa dengan program Tahfidz minimal 5 Juz serta pembelajaran agama & teknologi untuk membentuk karakter dan kepemimpinan unggul.",
  },
]

// Scroll range untuk setiap step — masing-masing muncul di titik scroll berbeda
const stepRanges: Array<{
  range: number[]
  opacity: number[]
  y: number[]
}> = [
  { range: [0.0, 0.08, 0.75], opacity: [0, 1, 1], y: [20, 0, 0] },
  { range: [0.12, 0.20, 0.75], opacity: [0, 1, 1], y: [20, 0, 0] },
  { range: [0.24, 0.32, 0.75], opacity: [0, 1, 1], y: [20, 0, 0] },
  { range: [0.36, 0.44, 0.75], opacity: [0, 1, 1], y: [20, 0, 0] },
  { range: [0.48, 0.56, 0.75], opacity: [0, 1, 1], y: [20, 0, 0] },
  { range: [0.60, 0.68, 0.75], opacity: [0, 1, 1], y: [20, 0, 0] },
]

// ── StepCard: komponen terpisah ───────────────────────────────────────────────
type StepCardProps = {
  step: StepItem
  rangeIndex: number
  scrollYProgress: MotionValue<number>
}

function StepCard({ step, rangeIndex, scrollYProgress }: StepCardProps) {
  const config = stepRanges[rangeIndex]

  const opacity = useTransform(scrollYProgress, config.range, config.opacity)
  const y = useTransform(scrollYProgress, config.range, config.y)

  return (
    <motion.div
      style={{ opacity, y }}
      className="relative flex flex-col justify-between py-2 sm:py-3"
    >
      <div>
        <span
          className="text-xs font-mono tracking-widest text-gray-400 font-semibold"
          aria-hidden="true"
        >
          {step.stepNumber}
        </span>
        <h3 className="mt-1 sm:mt-2 text-base sm:text-lg lg:text-xl font-medium text-white text-pretty">
          {step.title}
        </h3>
        <p className="mt-1.5 text-xs text-justify leading-relaxed text-neutral-400 sm:text-sm">
          {step.description}
        </p>
      </div>

      {/* Garis bawah dekoratif */}
      <div className="relative mt-4 w-full border-t border-neutral-800" aria-hidden="true">
        <span className="absolute -top-[7px] -left-1 text-xs text-neutral-600 font-mono select-none">
          +
        </span>
        <span className="absolute -top-[7px] -right-1 text-xs text-neutral-600 font-mono select-none">
          +
        </span>
      </div>
    </motion.div>
  )
}

// ── HowWeWork: komponen utama ─────────────────────────────────────────────────
export default function HowWeWork() {
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  // Exit animation agar bagian ini fade out sebelum menyentuh footer
  const frameOpacity = useTransform(scrollYProgress, [0.75, 0.92], [1, 0])
  const frameY = useTransform(scrollYProgress, [0.75, 0.92], [0, -20])
  const frameScale = useTransform(scrollYProgress, [0.75, 0.92], [1, 0.98])

  return (
    <section
      data-nav-theme="dark"
      ref={containerRef}
      className="relative w-full h-[300vh] bg-[#0a0e27] text-white"
      aria-label="Proses kerja kami"
    >
      {/* Sticky viewport frame */}
      <div className="sticky top-0 flex h-screen w-full flex-col justify-between px-6 pt-16 pb-8 sm:px-12 md:px-16 lg:px-24 md:pt-20 md:pb-10 overflow-hidden">
        <motion.div
          style={{ opacity: frameOpacity, y: frameY, scale: frameScale }}
          className="flex flex-col justify-between h-full max-w-7xl mx-auto w-full"
        >
          {/* Header */}
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-white mb-2 sm:mb-4">
              Mengapa memilih SMK TI BAZMA?
            </h2>
          </div>

          {/* Step Cards Grid */}
          <div
            className="my-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3 sm:gap-y-5 lg:gap-x-8"
            role="list"
          >
            {stepsData.map((step, index) => (
              <div key={step.id} role="listitem">
                <StepCard
                  step={step}
                  rangeIndex={index}
                  scrollYProgress={scrollYProgress}
                />
              </div>
            ))}
          </div>

          {/* Scroll Progress Bar */}
          <div className="relative w-full pb-2" aria-hidden="true">
            <div className="mt-2 h-[1px] w-full bg-neutral-900 rounded-full overflow-hidden">
              <motion.div
                style={{ scaleX: scrollYProgress, transformOrigin: "left" }}
                className="h-full bg-white"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

