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
      iconBg: "text-blue-700",
      accentBar: "bg-blue-600",
    },
    success: {
      iconBg: "text-emerald-700",
      accentBar: "bg-emerald-600",
    },
    warning: {
      iconBg: "text-amber-700",
      accentBar: "bg-amber-600",
    },
    default: {
      iconBg: "text-slate-700",
      accentBar: "bg-slate-600",
    },
  };

  const style = variantStyles[variant] || variantStyles.default;

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-white p-5 border transition-all duration-150 hover:border-slate-500 shadow-xs hover:shadow-md`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
          {description && (
            <p className="mt-1 text-xs text-slate-500 font-normal">{description}</p>
          )}
        </div>
        {Icon && (
          <Icon className={`h-8 w-8 ${style.iconBg}`} />
        )}
      </div>
      <div className={`absolute bottom-0 left-0 h-1 w-full ${style.accentBar}`} />
    </div>
  );
}