"use client";

import React from "react";
import { StatusPeserta } from "./types";
import { CheckCircle2, Clock } from "lucide-react";

interface StatusBadgeProps {
  status: StatusPeserta;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const isVerified = status === "Sudah Diverifikasi";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ${
        isVerified
          ? "bg-emerald-50 text-emerald-800 border border-emerald-200/80"
          : "bg-amber-50 text-amber-800 border border-amber-200/80"
      }`}
    >
      {isVerified ? (
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
      ) : (
        <Clock className="h-3.5 w-3.5 text-amber-600 shrink-0" />
      )}
      <span>{status}</span>
    </span>
  );
}
