"use client"

import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react"
import SwipeToast from "@/components/SwipeToast"

type FormStatusAlertProps = {
  message: string
  type: "info" | "success" | "error" | "warning"
  onDismiss: () => void
}

export function FormStatusAlert({ message, type, onDismiss }: FormStatusAlertProps) {
  const appearance = {
    info: { title: "Informasi", icon: <Info />, background: "#132b6d", fuseColor: "#93c5fd" },
    success: { title: "Berhasil", icon: <CircleCheck />, background: "#14532d", fuseColor: "#86efac" },
    warning: { title: "Perlu diperiksa", icon: <TriangleAlert />, background: "#78350f", fuseColor: "#fcd34d" },
    error: { title: "Gagal", icon: <CircleAlert />, background: "#7f1d1d", fuseColor: "#fca5a5" },
  }[type]

  return (
    <SwipeToast
      title={appearance.title}
      description={message}
      icon={appearance.icon}
      background={appearance.background}
      color="#ffffff"
      fuseColor={appearance.fuseColor}
      role={type === "error" ? "alert" : "status"}
      ariaLive={type === "error" ? "assertive" : "polite"}
      duration={type === "error" || type === "warning" ? 8000 : 4500}
      closeButton
      onClose={onDismiss}
    />
  )
}
