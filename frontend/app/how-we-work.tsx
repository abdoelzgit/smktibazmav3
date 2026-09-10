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
    title: "Pahami",
    description:
      "Kami memulai dengan mendengarkan. Memahami visi, tantangan, dan konteks Anda memungkinkan kami mendefinisikan masalah yang tepat sebelum merancang solusi.",
  },
  {
    id: 2,
    stepNumber: "02",
    title: "Rancang & Arsitektur",
    description:
      "Kami menerjemahkan wawasan menjadi sistem — desain yang matang, interaksi yang terarah, dan eksekusi yang presisi.",
  },
  {
    id: 3,
    stepNumber: "03",
    title: "Kembangkan & Bangun",
    description:
      "Membangun aplikasi yang skalabel dan berperforma tinggi dengan praktik rekayasa perangkat lunak modern dan teknologi cloud.",
  },
  {
    id: 4,
    stepNumber: "04",
    title: "Uji & Jaminan Kualitas",
    description:
      "Pengujian ketat, review kode, dan optimasi performa untuk memastikan keandalan dan keamanan tingkat produksi.",
  },
  {
    id: 5,
    stepNumber: "05",
    title: "Deploy & Peluncuran",
    description:
      "Pipeline deployment berkelanjutan dan pengaturan infrastruktur yang mulus untuk rilis tanpa downtime.",
  },
  {
    id: 6,
    stepNumber: "06",
    title: "Pantau & Kembangkan",
    description:
      "Pemantauan berkelanjutan, pemeliharaan proaktif, dan iterasi fitur untuk mendukung pertumbuhan jangka panjang.",
  },
]

// Scroll range untuk setiap step — masing-masing muncul di titik scroll berbeda
const stepRanges: Array<{
  range: number[]
  opacity: number[]
  y: number[]
}> = [
  { range: [0, 0.05, 1], opacity: [0, 1, 1], y: [20, 0, 0] },
  { range: [0.1, 0.2, 1], opacity: [0, 1, 1], y: [20, 0, 0] },
  { range: [0.25, 0.35, 1], opacity: [0, 1, 1], y: [20, 0, 0] },
  { range: [0.4, 0.5, 1], opacity: [0, 1, 1], y: [20, 0, 0] },
  { range: [0.55, 0.65, 1], opacity: [0, 1, 1], y: [20, 0, 0] },
  { range: [0.7, 0.8, 1], opacity: [0, 1, 1], y: [20, 0, 0] },
]

// ── StepCard: komponen terpisah supaya useTransform dipanggil di level ────────
// komponen, bukan di dalam .map() — sesuai React Rules of Hooks.
type StepCardProps = {
  step: StepItem
  rangeIndex: number
  scrollYProgress: MotionValue<number>
}

function StepCard({ step, rangeIndex, scrollYProgress }: StepCardProps) {
  const config = stepRanges[rangeIndex]

  // ✅ Hook dipanggil di level atas StepCard (bukan di dalam .map())
  const opacity = useTransform(scrollYProgress, config.range, config.opacity)
  const y = useTransform(scrollYProgress, config.range, config.y)

  return (
    <motion.div
      style={{ opacity, y }}
      className="relative flex flex-col justify-between pb-6 pt-4"
    >
      <div>
        <span
          className="text-xs font-mono tracking-widest text-neutral-500"
          aria-hidden="true"
        >
          {step.stepNumber}
        </span>
        <h3 className="mt-3 text-xl font-medium text-white sm:text-2xl text-pretty">
          {step.title}
        </h3>
        <p className="mt-3 text-xs leading-relaxed text-neutral-400 sm:text-sm">
          {step.description}
        </p>
      </div>

      {/* Garis bawah dekoratif */}
      <div className="relative mt-8 w-full border-t border-neutral-800" aria-hidden="true">
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

  return (
    <section
      data-nav-theme="dark"
      ref={containerRef}
      className="relative w-full h-[400vh] bg-[#0a0e27] text-white"
      aria-label="Proses kerja kami"
    >
      {/* Sticky viewport frame */}
      <div className="sticky top-0 flex h-screen w-full flex-col justify-between px-6 pt-24 pb-8 sm:px-12 md:px-16 lg:px-24 md:pt-28 md:pb-10">

        {/* Header */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[220px_1fr]">
          <div>
            <p className="text-xs font-mono tracking-widest text-neutral-400">
              Proses kami
            </p>
          </div>
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl text-balance">
              Bagaimana kami bekerja
            </h2>
            <p className="mt-2 text-xs text-neutral-400 sm:text-sm">
              Metode berulang yang kami terapkan di setiap program &amp; proyek.
            </p>
          </div>
        </div>

        {/* Step Cards Grid */}
        <div
          className="my-auto grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2 lg:grid-cols-3"
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
      </div>
    </section>
  )
}
