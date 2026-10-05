"use client"

import { ReactLenis, useLenis } from "lenis/react"
import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

function LenisSync() {
  const lenis = useLenis()
  const pathname = usePathname()
  const prevHeightRef = useRef<number>(0)

  // Sinkronisasi ScrollTrigger dengan event scroll Lenis (Native RAF)
  useEffect(() => {
    if (!lenis) return

    lenis.on("scroll", ScrollTrigger.update)

    return () => {
      lenis.off("scroll", ScrollTrigger.update)
    }
  }, [lenis])

  // Reset scroll dan perbarui bounds saat rute berpindah
  useEffect(() => {
    if (!lenis) return

    lenis.scrollTo(0, { immediate: true })

    // Memaksa Lenis dan ScrollTrigger menghitung ulang tinggi dokumen baru
    const rafId = requestAnimationFrame(() => {
      lenis?.resize()
      ScrollTrigger.refresh(true)
    })

    const timer = setTimeout(() => {
      lenis?.resize()
      ScrollTrigger.refresh(true)
    }, 250)

    return () => {
      cancelAnimationFrame(rafId)
      clearTimeout(timer)
    }
  }, [pathname, lenis])

  // ResizeObserver untuk konten dinamis yang merubah tinggi halaman
  useEffect(() => {
    if (!lenis || typeof window === "undefined") return

    let timeoutId: ReturnType<typeof setTimeout> | null = null

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return

      const currentHeight = Math.round(entry.contentRect.height)
      // Hanya refresh jika tinggi konten berubah signifikan (> 10px)
      if (Math.abs(currentHeight - prevHeightRef.current) < 10) return

      prevHeightRef.current = currentHeight

      if (timeoutId) clearTimeout(timeoutId)

      timeoutId = setTimeout(() => {
        lenis?.resize()
        ScrollTrigger.refresh()
        timeoutId = null
      }, 250)
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
        lerp: 0.08,
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.5,
      }}
    >
      <LenisSync />
      {children}
    </ReactLenis>
  )
}