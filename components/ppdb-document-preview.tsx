"use client"

import { useEffect, useMemo } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"

interface DocumentPreviewDialogProps {
  open: boolean
  file: File | string | null
  title: string
  onOpenChange: (open: boolean) => void
}

export function DocumentPreviewDialog({ open, file, title, onOpenChange }: DocumentPreviewDialogProps) {
  const isLocalFile = file !== null && typeof file !== "string"
  const fileUrl = useMemo(() => {
    if (!file) return ""
    if (typeof file === "string") return file
    return URL.createObjectURL(file)
  }, [file])
  const isPdf = isLocalFile
    ? file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
    : typeof file === "string" && file.split(/[?#]/, 1)[0].toLowerCase().endsWith(".pdf")

  useEffect(() => {
    if (isLocalFile && fileUrl) return () => URL.revokeObjectURL(fileUrl)
  }, [fileUrl, isLocalFile])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <div className="space-y-1 pr-8">
          <DialogTitle>Pratinjau {title}</DialogTitle>
          <DialogDescription>{isPdf ? "Pratinjau dokumen PDF." : "Pratinjau gambar."}</DialogDescription>
        </div>
        <div className="mt-2 flex min-h-48 items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-gray-50 p-2">
          {fileUrl && (isPdf ? (
            <iframe title={`Pratinjau ${title}`} src={fileUrl} className="h-[min(70vh,720px)] w-full rounded-sm" />
          ) : (
            <Image
              src={fileUrl}
              alt={`Pratinjau ${title}`}
              width={1400}
              height={1000}
              unoptimized
              className="mx-auto max-h-[70vh] w-auto max-w-full object-contain"
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
