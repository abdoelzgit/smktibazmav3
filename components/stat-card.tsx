"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number | string;
  description?: string;
  icon?: LucideIcon;
  variant?: "primary" | "success" | "warning" | "default";
}

export default function StatCard({
  label,
  value,
  description,
  icon: Icon,
  variant = "default",
}: StatCardProps) {
  const variantStyles = {
    primary: {
      border: "border-blue-200/80 hover:border-blue-300",
      iconBg: "bg-blue-50 text-blue-700",
      accentBar: "bg-blue-600",
    },
    success: {
      border: "border-emerald-200/80 hover:border-emerald-300",
      iconBg: "bg-emerald-50 text-emerald-700",
      accentBar: "bg-emerald-600",
    },
    warning: {
      border: "border-amber-200/80 hover:border-amber-300",
      iconBg: "bg-amber-50 text-amber-700",
      accentBar: "bg-amber-600",
    },
    default: {
      border: "border-slate-200/80 hover:border-slate-300",
      iconBg: "bg-slate-100 text-slate-700",
      accentBar: "bg-slate-600",
    },
  };

  const style = variantStyles[variant] || variantStyles.default;

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-white p-5 border shadow-xs transition-all duration-150 ${style.border}`}
    >
      <div className={`absolute top-0 left-0 h-1 w-full ${style.accentBar}`} />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
          {description && (
            <p className="mt-1 text-xs text-slate-500 font-normal">{description}</p>
          )}
        </div>
        {Icon && (
          <div className={`rounded-lg p-2.5 shrink-0 ${style.iconBg}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}