"use client"

import React, { useRef } from "react"
import { motion, useScroll, useTransform, MotionValue } from "framer-motion"

interface CoreValueItem {
  title: string
  description: string
}

interface CardBodyProps {
  item: CoreValueItem
  isLast: boolean
}

interface AnimatedRowProps {
  index: number
  range: [number, number]
  scrollYProgress: MotionValue<number>
  wrapperClass: string
  children: React.ReactNode
}

interface CoreValueRowProps {
  item: CoreValueItem
  index: number
  isLast: boolean
  // undefined = card statis (card pertama), tidak terikat scroll sama sekali
  range?: [number, number]
  scrollYProgress: MotionValue<number>
}

const coreValues: CoreValueItem[] = [
  { title: "Mudah Bergaul", description: "Membangun hubungan yang hangat dan saling menghargai." },
  { title: "Mandiri", description: "Mampu mengembangkan diri dan bertanggung jawab." },
  { title: "Professional", description: "Bekerja sesuai kompetensi dan etika." },
  { title: "Gigih", description: "Semangat pantang menyerah." },
]

// Track = 350vh, sticky = 100vh -> jarak scroll efektif 250vh (progress 0 -> 1).
// - 0.05 -> 0.65 : card 2, 3, 4 masuk satu per satu (berurutan, tidak tumpang tindih)
// - 0.65 -> 1    : HOLD. Keempat card tetap di posisi final (~87vh scroll),
//                  sticky baru lepas di progress 1, lalu section lewat secara natural.
const ANIMATED_RANGES: Array<[number, number]> = [
  [0.05, 0.25],
  [0.25, 0.45],
  [0.45, 0.65],
]

// Bayangan tipis dan natural. Struktur string harus identik agar bisa diinterpolasi.
const FLAT_SHADOW = "0 1px 2px rgba(15, 23, 42, 0.05)"
const ENTER_SHADOW = "0 4px 10px rgba(15, 23, 42, 0.08)"

function CardBody({ item, isLast }: CardBodyProps) {
  const cardClass = isLast
    ? "relative bg-white border-x border-t border-b border-slate-200 px-6 py-8 sm:px-10 sm:py-10 grid grid-cols-1 sm:grid-cols-12 gap-4"
    : "relative bg-white border-x border-t border-slate-200 px-6 py-8 sm:px-10 sm:py-10 grid grid-cols-1 sm:grid-cols-12 gap-4"

  return (
    <div className={cardClass}>
      <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-transparent pointer-events-none" />
      <h3 className="sm:col-span-4 text-xl sm:text-2xl font-bold text-[#1e3a8a] relative z-10">
        {item.title}
      </h3>
      <p className="sm:col-span-8 flex items-center text-sm sm:text-base text-slate-600 leading-relaxed relative z-10">
        {item.description}
      </p>
    </div>
  )
}

// Card animasi (index 1, 2, 3).
// Setiap nilai punya keyframe eksplisit [0, start, end, 1]:
//   progress <= start : kondisi awal (tersembunyi/miring)
//   start -> end      : animasi masuk mengikuti scroll
//   progress >= end   : TERKUNCI di kondisi final sampai progress 1
// Opacity hanya dipakai untuk kemunculan awal, lalu tetap 1.
function AnimatedRow({ index, range, scrollYProgress, wrapperClass, children }: AnimatedRowProps) {
  const [start, end] = range
  const fadeEnd = start + (end - start) * 0.4

  const rotateX = useTransform(scrollYProgress, [0, start, end, 1], [-90, -90, 0, 0])
  const scale = useTransform(scrollYProgress, [0, start, end, 1], [0.95, 0.95, 1, 1])
  const opacity = useTransform(scrollYProgress, [0, start, fadeEnd, 1], [0, 0, 1, 1])
  const boxShadow = useTransform(
    scrollYProgress,
    [0, start, end, 1],
    [ENTER_SHADOW, ENTER_SHADOW, FLAT_SHADOW, FLAT_SHADOW]
  )

  return (
    <motion.div
      style={{
        rotateX,
        scale,
        opacity,
        boxShadow,
        transformOrigin: "top center",
        zIndex: 10 + index, // card yang lebih baru selalu di atas
        backfaceVisibility: "hidden",
      }}
      className={wrapperClass}
    >
      {children}
    </motion.div>
  )
}

function CoreValueRow({ item, index, isLast, range, scrollYProgress }: CoreValueRowProps) {
  const wrapperClass = isLast ? "relative" : "relative mb-[-20px]"
  const body = <CardBody item={item} isLast={isLast} />

  // Card pertama: statis, selalu terlihat penuh sejak awal, tanpa hook scroll.
  if (!range) {
    return (
      <div style={{ zIndex: 10 + index, boxShadow: FLAT_SHADOW }} className={wrapperClass}>
        {body}
      </div>
    )
  }

  return (
    <AnimatedRow
      index={index}
      range={range}
      scrollYProgress={scrollYProgress}
      wrapperClass={wrapperClass}
    >
      {body}
    </AnimatedRow>
  )
}

export default function CoreValue() {
  const trackRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  })

  const headerY = useTransform(scrollYProgress, [0, 0.15], [0, -12])

  return (
    // TRACK SCROLL: hanya memberi "jarak" scroll untuk animasi.
    // - TANPA margin negatif & TANPA isolate: tidak ada section lain yang menimpa card.
    // - min-h-[350vh] -> 350vh - 100vh (sticky) = 250vh jarak scroll efektif.
    // - Card baru meninggalkan layar saat track selesai dilewati secara natural.
    <div
      ref={trackRef}
<<<<<<< HEAD
=======
      data-nav-theme="light"
>>>>>>> asrama
      className="relative w-full bg-[#f1f5f9] min-h-[350vh] px-4 sm:px-6 lg:px-8"
    >

      {/* STICKY AREA: tinggi h-screen, header & tumpukan card tetap di viewport
          sampai progress 1 (bawah track menyentuh bawah layar) */}
      <div className="sticky top-0 h-screen flex items-start pt-[18vh] sm:pt-[22vh] pb-0">

        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16">

          {/* HEADER */}
          <div className="md:col-span-4 flex flex-col justify-start h-full">
            <motion.div style={{ y: headerY }} className="text-center md:text-left">
              <h2 className="text-4xl sm:text-5xl font-bold text-[#132B6D] leading-tight mb-4">
                Core Value
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xs mx-auto md:mx-0">
                &quot;Kami membangun fondasi kuat melalui integritas, kemandirian, dan semangat kolaborasi yang tulus dalam setiap langkah.
              </p>
            </motion.div>
          </div>

          {/* KONTEN: perspective saja, TANPA preserve-3d supaya zIndex bekerja konsisten */}
          <div className="md:col-span-8 relative [perspective:2000px]">
            {coreValues.map((item, index) => (
              <CoreValueRow
                key={item.title}
                item={item}
                index={index}
                isLast={index === coreValues.length - 1}
                range={index === 0 ? undefined : ANIMATED_RANGES[index - 1]}
                scrollYProgress={scrollYProgress}
              />
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}