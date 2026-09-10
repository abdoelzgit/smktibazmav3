"use client"

import { ReactLenis, useLenis } from "lenis/react"
import { useEffect } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenis = useLenis(({ scroll }) => {
    // opsional: callback tiap frame scroll
  })

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
