"use client"

import { useEffect, useState, type CSSProperties } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import {
  ImageCropperImage,
  ImageCropperRootProvider,
  ImageCropperSelection,
  useImageCropper,
} from "@/components/ui/image-cropper"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface PhotoCropDialogProps {
  open: boolean
  imageUrl: string | null
  fileName: string
  onCancel: () => void
  onCrop: (file: File) => void
  onError: (message: string) => void
}

export function PhotoCropDialog({ open, imageUrl, fileName, onCancel, onCrop, onError }: PhotoCropDialogProps) {
  const [isSavingCrop, setIsSavingCrop] = useState(false)
  const [loadedImage, setLoadedImage] = useState<{ src: string; width: number; height: number } | null>(null)
  const [viewportHeight, setViewportHeight] = useState(0)

  useEffect(() => {
    if (!open) return

    const visualViewport = window.visualViewport
    const updateViewportHeight = () => {
      setViewportHeight(visualViewport?.height ?? window.innerHeight)
    }

    updateViewportHeight()
    window.addEventListener("resize", updateViewportHeight)
    visualViewport?.addEventListener("resize", updateViewportHeight)

    return () => {
      window.removeEventListener("resize", updateViewportHeight)
      visualViewport?.removeEventListener("resize", updateViewportHeight)
    }
  }, [open])

  useEffect(() => {
    if (!open || !imageUrl) return

    let cancelled = false
    const image = new window.Image()
    const setImageSize = () => {
      if (cancelled) return
      if (image.naturalWidth > 0 && image.naturalHeight > 0) {
        setLoadedImage({ src: imageUrl, width: image.naturalWidth, height: image.naturalHeight })
      } else {
        onError("Foto gagal dibuka. Silakan pilih foto lain.")
      }
    }

    image.addEventListener("load", setImageSize, { once: true })
    image.addEventListener("error", setImageSize, { once: true })
    image.src = imageUrl
    if (image.complete) setImageSize()

    return () => {
      cancelled = true
      image.removeEventListener("load", setImageSize)
      image.removeEventListener("error", setImageSize)
    }
  }, [open, imageUrl, onError])

  const cropper = useImageCropper({
    aspectRatio: 4 / 5,
    defaultZoom: 1,
    minZoom: 1,
    maxZoom: 4,
    zoomStep: 0.1,
    nudgeStep: 4,
    nudgeStepShift: 16,
    translations: {
      rootLabel: "Sesuaikan foto formal",
      selectionLabel: () => "Area foto yang disimpan",
      selectionInstructions: "Geser area crop atau gunakan tombol panah untuk mengatur posisi foto.",
    },
  })
  const maxCanvasHeight = Math.min(480, viewportHeight * 0.5)
  const imageAspect = loadedImage ? loadedImage.width / loadedImage.height : 0
  const canvasWidth = Math.min(320, maxCanvasHeight * imageAspect)

  const handleCrop = async () => {
    if (!cropper.naturalSize.width || !cropper.viewportRect.width) return

    setIsSavingCrop(true)
    try {
      const result = await cropper.getCroppedImage({
        type: "image/jpeg",
        quality: 0.92,
        maxSize: { width: 640, height: 800 },
        output: "blob",
      })
      if (!(result instanceof Blob)) throw new Error("Gagal membuat hasil crop foto.")

      const baseName = fileName.replace(/\.[^.]+$/, "") || "foto-formal"
      onCrop(new File([result], `${baseName}-crop.jpg`, { type: "image/jpeg", lastModified: Date.now() }))
    } catch (cause) {
      onError(cause instanceof Error ? cause.message : "Gagal menyesuaikan foto.")
      setIsSavingCrop(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onCancel() }}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] max-w-md overflow-y-auto">
        <div className="space-y-1 pr-8">
          <DialogTitle>Sesuaikan foto formal</DialogTitle>
          <DialogDescription>Geser area crop untuk menentukan posisi foto, lalu atur zoom bila diperlukan.</DialogDescription>
        </div>

        {imageUrl && loadedImage?.src === imageUrl && viewportHeight > 0 && (
          <ImageCropperRootProvider
            value={cropper}
            className="mx-auto mt-4 max-w-full overflow-hidden rounded-md border border-gray-300 bg-gray-100"
            style={{
              "--cropper-aspect": `${loadedImage.width} / ${loadedImage.height}`,
              width: `${canvasWidth}px`,
            } as CSSProperties}
          >
            <ImageCropperImage src={imageUrl} alt="Foto formal yang akan disesuaikan" />
            <ImageCropperSelection />
          </ImageCropperRootProvider>
        )}

        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="foto-formal-zoom" className="text-sm font-medium">Zoom</Label>
            <span className="text-xs tabular-nums text-gray-600">{cropper.zoom.toFixed(1)}×</span>
          </div>
          <Input
            id="foto-formal-zoom"
            type="range"
            min={1}
            max={4}
            step={0.1}
            value={cropper.zoom}
            onChange={(event) => cropper.setZoom(Number(event.target.value))}
            aria-label="Atur zoom foto"
            className="h-5 cursor-pointer rounded-none border-0 bg-transparent px-0 py-0 shadow-none accent-[#132b6d] focus-visible:ring-0"
          />
        </div>

        <p className="text-xs text-gray-500">Hasil crop disimpan dalam rasio 4:5.</p>
        <div className="mt-1 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" className="h-10" onClick={onCancel} disabled={isSavingCrop}>Batal</Button>
          <Button
            type="button"
            className="h-10 bg-[#132b6d] text-white hover:bg-[#0f2257]"
            onClick={handleCrop}
            disabled={!cropper.naturalSize.width || !cropper.viewportRect.width || isSavingCrop}
          >
            {isSavingCrop ? "Memproses foto..." : "Gunakan foto"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
