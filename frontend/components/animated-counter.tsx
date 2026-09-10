"use client"

import { useEffect, useRef, useState } from "react"
import { animate, useInView } from "framer-motion"

type AnimatedCounterProps = {
  value: string
  duration?: number
}

export function AnimatedCounter({ value, duration = 1.5 }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" })

  // Pisahkan angka dari suffix, misal "100+" -> number 100, suffix "+"
  const numericValue = parseInt(String(value).replace(/[^0-9]/g, ""), 10) || 0
  const suffix = String(value).replace(/[0-9]/g, "")

  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!isInView) return
    const controls = animate(0, numericValue, {
      duration,
      ease: "easeOut",
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    })
    return () => controls.stop()
  }, [isInView, numericValue, duration])

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  )
}
