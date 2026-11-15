"use client"

import React, { useEffect, useRef } from "react"

interface AsciiArtProps {
  className?: string
  src?: string
  density?: number
  opacity?: number
  fit?: "width" | "cover" | "contain"
  invert?: boolean
  theme?: "light" | "dark"
}

/**
 * AsciiArt Component
 * Converts an image into an animated, responsive ASCII art canvas.
 * Zero external video dependencies — renders directly from source image.
 */
export function AsciiArt({
  className,
  src = "/images/creation-of-adam.png",
  density = 1,
  opacity = 0.85,
  fit = "width",
  invert = true,
  theme = "light",
}: AsciiArtProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number
    let isDestroyed = false

    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = src

    // Character ramp ordered from sparse to dense
    const CHARS = " .,:;+=xX$#@"
    const CHARS_LEN = CHARS.length

    // Offscreen sampling canvas
    const sampleCanvas = document.createElement("canvas")
    const sampleCtx = sampleCanvas.getContext("2d", { willReadFrequently: true })

    // Cached grid state
    let cachedGrid: {
      cols: number
      rows: number
      startCol: number
      startRow: number
      cellW: number
      cellH: number
      fontSize: number
      pixels: Float32Array // lum values
      alphas: Float32Array // alpha values
    } | null = null

    let lastWidth = 0
    let lastHeight = 0
    let time = 0

    function updateGrid() {
      if (!canvas || !sampleCtx || !img.complete || img.naturalWidth === 0) return

      const rect = canvas.getBoundingClientRect()
      const width = Math.floor(rect.width)
      const height = Math.floor(rect.height)

      if (width <= 0 || height <= 0) return

      lastWidth = width
      lastHeight = height

      const dpr = window.devicePixelRatio || 1
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)

      // Cell size calculation: responsive font size
      const baseFontSize = Math.max(6, Math.min(11, Math.floor(width / (105 * density))))
      const cellW = baseFontSize * 0.62
      const cellH = baseFontSize * 1.05

      const totalCols = Math.floor(width / cellW)
      const totalRows = Math.floor(height / cellH)

      if (totalCols <= 0 || totalRows <= 0) return

      const imgAspect = img.naturalWidth / img.naturalHeight
      const gridAspect = (totalCols * cellW) / (totalRows * cellH)

      let drawCols: number
      let drawRows: number
      let startCol: number
      let startRow: number

      if (fit === "width") {
        // Stretches across 100% of the canvas width (edge-to-edge)
        drawCols = totalCols
        drawRows = Math.max(1, Math.floor((totalCols * cellW) / (imgAspect * cellH)))
        startCol = 0
        startRow = Math.floor((totalRows - drawRows) / 2)
      } else if (fit === "cover") {
        if (gridAspect > imgAspect) {
          drawCols = totalCols
          drawRows = Math.max(1, Math.floor((totalCols * cellW) / (imgAspect * cellH)))
        } else {
          drawRows = totalRows
          drawCols = Math.max(1, Math.floor((totalRows * cellH * imgAspect) / cellW))
        }
        startCol = Math.floor((totalCols - drawCols) / 2)
        startRow = Math.floor((totalRows - drawRows) / 2)
      } else {
        // contain
        if (gridAspect > imgAspect) {
          drawRows = totalRows
          drawCols = Math.max(1, Math.floor((totalRows * cellH * imgAspect) / cellW))
        } else {
          drawCols = totalCols
          drawRows = Math.max(1, Math.floor((totalCols * cellW) / (imgAspect * cellH)))
        }
        startCol = Math.floor((totalCols - drawCols) / 2)
        startRow = Math.floor((totalRows - drawRows) / 2)
      }

      sampleCanvas.width = drawCols
      sampleCanvas.height = drawRows

      sampleCtx.clearRect(0, 0, drawCols, drawRows)
      sampleCtx.drawImage(img, 0, 0, drawCols, drawRows)

      let imgData: ImageData
      try {
        imgData = sampleCtx.getImageData(0, 0, drawCols, drawRows)
      } catch {
        return
      }

      const raw = imgData.data
      const totalPixels = drawCols * drawRows
      const pixels = new Float32Array(totalPixels)
      const alphas = new Float32Array(totalPixels)

      for (let i = 0; i < totalPixels; i++) {
        const idx = i * 4
        const a = raw[idx + 3]
        if (a < 20) {
          alphas[i] = 0
          pixels[i] = 0
        } else {
          alphas[i] = a / 255
          // Perceived luminance (0 - 1)
          pixels[i] = (0.299 * raw[idx] + 0.587 * raw[idx + 1] + 0.114 * raw[idx + 2]) / 255
        }
      }

      cachedGrid = {
        cols: drawCols,
        rows: drawRows,
        startCol,
        startRow,
        cellW,
        cellH,
        fontSize: baseFontSize,
        pixels,
        alphas,
      }
    }

    const render = () => {
      if (isDestroyed || !ctx) return

      const rect = canvas.getBoundingClientRect()
      const currentW = Math.floor(rect.width)
      const currentH = Math.floor(rect.height)

      if (currentW !== lastWidth || currentH !== lastHeight || !cachedGrid) {
        updateGrid()
      }

      if (cachedGrid) {
        const dpr = window.devicePixelRatio || 1
        ctx.save()
        ctx.scale(dpr, dpr)
        ctx.clearRect(0, 0, lastWidth, lastHeight)

        const { cols, rows, startCol, startRow, cellW, cellH, fontSize, pixels, alphas } = cachedGrid

        ctx.font = `600 ${fontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`
        ctx.textBaseline = "top"

        time += 0.025

        for (let r = 0; r < rows; r++) {
          const y = (startRow + r) * cellH
          // Skip if completely offscreen vertically
          if (y + cellH < 0 || y > lastHeight) continue

          const rowOffset = r * cols
          for (let c = 0; c < cols; c++) {
            const i = rowOffset + c
            const alpha = alphas[i]
            if (alpha <= 0) continue

            const rawLum = pixels[i]

            // Subtle animated glimmer/wave across the ASCII hand points
            const wave =
              Math.sin(c * 0.12 + r * 0.08 + time) * 0.08 +
              Math.cos(c * 0.05 - time * 0.7) * 0.04

            const animLum = Math.max(0, Math.min(1, rawLum + wave))

            // If invert is true, darker lines/shadows of the hand become the dense characters
            const effectiveLum = invert ? 1 - animLum : animLum

            const charIdx = Math.floor(effectiveLum * (CHARS_LEN - 1))
            const char = CHARS[charIdx]

            // Theme colors: Dark ink on light bg, or glowing sky-blue on dark bg
            const textAlpha = (alpha * opacity * (0.35 + effectiveLum * 0.65)).toFixed(3)
            if (theme === "light") {
              // Deep navy / ink tone on light background
              ctx.fillStyle = `rgba(19, 43, 109, ${textAlpha})`
            } else {
              // Sky-blue / cyan tone on dark background
              ctx.fillStyle = `rgba(186, 230, 253, ${textAlpha})`
            }

            const x = (startCol + c) * cellW
            ctx.fillText(char, x, y)
          }
        }

        ctx.restore()
      }

      animationFrameId = requestAnimationFrame(render)
    }

    img.onload = () => {
      updateGrid()
    }

    if (img.complete) {
      updateGrid()
    }

    render()

    const handleResize = () => {
      updateGrid()
    }

    window.addEventListener("resize", handleResize)

    return () => {
      isDestroyed = true
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener("resize", handleResize)
    }
  }, [src, density, opacity, fit, invert, theme])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-label="The Creation of Adam — Animated ASCII Art"
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  )
}
