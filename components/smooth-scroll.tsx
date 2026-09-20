"use client"

import { ReactLenis, useLenis } from "lenis/react"
import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenis = useLenis(({ scroll }) => {
    // opsional: callback tiap frame scroll
  })
  const pathname = usePathname()
  const hasResizedRef = useRef(false)

  useEffect(() => {
    if (!lenis) return
    const activeLenis = lenis

    // sinkronkan Lenis dengan ticker GSAP supaya ScrollTrigger akurat
    function raf(time: number) {
      activeLenis.raf(time * 1000)
    }
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    // update ScrollTrigger tiap kali lenis scroll
    activeLenis.on("scroll", ScrollTrigger.update)

    return () => {
      activeLenis.off("scroll", ScrollTrigger.update)
      gsap.ticker.remove(raf)
    }
  }, [lenis])

  // Reset scroll saat rute berubah
  useEffect(() => {
    if (!lenis) return
    // Reset posisi scroll ke paling atas tanpa delay
    lenis.scrollTo(0, { immediate: true })
    // Re-calculate tinggi halaman
    requestAnimationFrame(() => {
      lenis.resize()
      ScrollTrigger.refresh()
      // Trigger kedua untuk memastikan height terhitung setelah gambar lazy load
      requestAnimationFrame(() => {
        lenis.resize()
        ScrollTrigger.refresh()
      })
    })
  }, [pathname, lenis])

  // ResizeObserver untuk menangkap perubahan konten (misal: gambar lazy loaded)
  useEffect(() => {
    if (!lenis) return
    const observer = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        lenis.resize()
        ScrollTrigger.refresh()
      })
    })
    observer.observe(document.body)
    return () => observer.disconnect()
  }, [lenis])

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,        // smoothness, 0.05–0.15 enak
        duration: 1.2,
        smoothWheel: true,
        touchMultiplier: 2,
      }}
    >
      {children}
    </ReactLenis>
  )
}
