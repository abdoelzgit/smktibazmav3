"use client"

import React, { useRef } from "react"
import { motion, useScroll, useTransform, MotionValue } from "framer-motion"

interface CoreValueItem {
  title: string
  description: string
}

interface CoreValueRowProps {
  item: CoreValueItem
  index: number
  range: number[]
  scrollYProgress: MotionValue<number>
}

interface StackBaseProps {
  scrollYProgress: MotionValue<number>
}

const coreValues: CoreValueItem[] = [
  { title: "Mudah Bergaul", description: "Membangun hubungan yang hangat dan saling menghargai." },
  { title: "Mandiri", description: "Mampu mengembangkan diri dan bertanggung jawab." },
  { title: "Professional", description: "Bekerja sesuai kompetensi dan etika." },
  { title: "Gigih", description: "Semangat pantang menyerah." },
]

const ROW_RANGES = [
  [0.05, 0.25],
  [0.25, 0.45],
  [0.45, 0.65],
  [0.65, 0.85],
]

function CoreValueRow({ item, index, range, scrollYProgress }: CoreValueRowProps) {
  const [start, end] = range

  const rotateX = useTransform(scrollYProgress, [start, end], [-90, 0])
  const scale = useTransform(scrollYProgress, [start, end], [0.95, 1])
  const opacity = useTransform(scrollYProgress, [start, start + 0.05], [0, 1])
  const brightness = useTransform(scrollYProgress, [start, end], [0.8, 1])
  const boxShadow = useTransform(
    scrollYProgress,
    [start, end],
    ["0 20px 40px rgba(0,0,0,0.3)", "0 2px 4px rgba(0,0,0,0.05)"]
  )

  return (
    <motion.div
      style={{
        rotateX,
        scale,
        opacity,
        transformOrigin: "top center",
        zIndex: 10 + index,
        boxShadow,
        filter: `brightness(${brightness})`,
      }}
      className="relative mb-[-20px]" 
    >
      <div className="relative bg-white border-x border-t border-slate-200 px-6 py-8 sm:px-10 sm:py-10 grid grid-cols-1 sm:grid-cols-12 gap-4">
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-transparent pointer-events-none" />
        <h3 className="sm:col-span-4 text-xl sm:text-2xl font-bold text-[#1e3a8a] relative z-10">
          {item.title}
        </h3>
        <p className="sm:col-span-8 flex items-center text-sm sm:text-base text-slate-600 leading-relaxed relative z-10">
          {item.description}
        </p>
      </div>
    </motion.div>
  )
}

function StackBase({ scrollYProgress }: StackBaseProps) {
  const height = useTransform(
    scrollYProgress,
    [0, ROW_RANGES[ROW_RANGES.length - 1][1]],
    [160, 0]
  )
  const opacity = useTransform(
    scrollYProgress,
    [ROW_RANGES[ROW_RANGES.length - 1][1] - 0.1, ROW_RANGES[ROW_RANGES.length - 1][1]],
    [1, 0]
  )

  return (
    <motion.div
      style={{
        height,
        opacity,
        clipPath: "polygon(2% 0%, 98% 0%, 90% 100%, 10% 100%)",
      }}
      className="w-full bg-slate-200 mt-[-20px]"
    />
  )
}

export default function CoreValue() {
  const trackRef = useRef(null)

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  })

  const headerY = useTransform(scrollYProgress, [0, 0.15], [0, -12])

  return (
    // TRACK SCROLL: Wrapper luar ini yang memberikan "jarak" untuk scroll
    // TIDAK sticky, hanya berfungsi sebagai pengukur durasi animasi
    <div ref={trackRef} className="w-full bg-[#f1f5f9] min-h-[250vh] px-4 sm:px-6 lg:px-8">
      
      {/* STICKY AREA: Tingginya HANYA h-screen. 
          Ini menjamin header & kartu pertama SELALU terlihat di viewport */}
      <div className="sticky top-0 h-screen flex items-start pt-[18vh] sm:pt-[22vh] pb-0">

        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16">

          {/* HEADER: Aman karena parent sticky-nya hanya setinggi layar */}
          <div className="md:col-span-4 flex flex-col justify-start h-full">
            <motion.div
              style={{ y: headerY }}
              className="text-center md:text-left"
            >
              <h2 className="text-4xl sm:text-5xl font-bold text-[#132B6D] leading-tight mb-4">
                Core Value
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xs mx-auto md:mx-0">
"Kami membangun fondasi kuat melalui integritas, kemandirian, dan semangat kolaborasi yang tulus dalam setiap langkah.              </p>
            </motion.div>
          </div>

          {/* KONTEN: pb-[50vh] dihapus — itu penyebab card & StackBase terdorong
              ke luar batas bawah viewport (sticky area tidak scroll internal,
              jadi konten yang melebihi h-screen bukan hilang, tapi cuma
              turun di bawah layar dan jadi tak terlihat) */}
          <div className="md:col-span-8 relative [perspective:2000px] [transform-style:preserve-3d]">
            {coreValues.map((item, index) => (
              <CoreValueRow
                key={item.title}
                item={item}
                index={index}
                range={ROW_RANGES[index]}
                scrollYProgress={scrollYProgress}
              />
            ))}
            <StackBase scrollYProgress={scrollYProgress} />
          </div>

        </div>
      </div>
    </div>
  )
}