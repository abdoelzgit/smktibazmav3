"use client"

import { ReactLenis, useLenis } from "lenis/react"
import { useEffect } from "react"
import { usePathname } from "next/navigation"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

// ✅ Fix #2: Pisahkan logic ke komponen anak supaya useLenis bisa
//    mengakses context ReactLenis yang sudah ter-render
function LenisSync() {
  // ✅ Fix #3: Tidak perlu callback kalau tidak dipakai
  const lenis = useLenis()
  const pathname = usePathname()

  // Sinkronisasi Lenis dengan ticker GSAP
  useEffect(() => {
    if (!lenis) return

    function raf(time: number) {
      lenis?.raf(time * 1000)
    }

    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)
    lenis.on("scroll", ScrollTrigger.update)

    return () => {
      lenis.off("scroll", ScrollTrigger.update)
      gsap.ticker.remove(raf)
    }
  }, [lenis])

  // Reset scroll dan perbarui bounds saat rute berpindah
  useEffect(() => {
    if (!lenis) return

    lenis.scrollTo(0, { immediate: true })

    // Memaksa Lenis dan ScrollTrigger menghitung ulang tinggi dokumen baru
    requestAnimationFrame(() => {
      lenis?.resize()
      ScrollTrigger.refresh(true)
    })

    const timer = setTimeout(() => {
      lenis?.resize()
      ScrollTrigger.refresh(true)
    }, 250)

    return () => clearTimeout(timer)
  }, [pathname, lenis])

  // ResizeObserver untuk konten yang berubah (lazy image, dll)
  // Debounce untuk mencegah rapid consecutive ScrollTrigger.refresh() calls
  useEffect(() => {
    if (!lenis) return

    let timeoutId: ReturnType<typeof setTimeout> | null = null

    const observer = new ResizeObserver(() => {
      if (timeoutId) clearTimeout(timeoutId)

      timeoutId = setTimeout(() => {
        lenis?.resize()
        ScrollTrigger.refresh()
        timeoutId = null
      }, 150)
    })

    observer.observe(document.body)
    return () => {
      observer.disconnect()
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [lenis])

  return null
}

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,
        duration: 1.2,
        smoothWheel: true,
        touchMultiplier: 2,
      }}
    >
      {/* ✅ LenisSync di dalam ReactLenis supaya context tersedia */}
      <LenisSync />
      {children}
    </ReactLenis>
  )
}