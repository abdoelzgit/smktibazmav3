"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import React from "react";

/**
 * Pengecualian label opsional jika ingin penamaan khusus yang berbeda dari nama folder rute.
 * Jika rute baru dibuat dan TIDAK terdaftar di sini, nama label akan TERFORMAT OTOMATIS.
 * Contoh: "jejak-karya" -> "Jejak Karya", "alumni-sekolah" -> "Alumni Sekolah"
 */
const CUSTOM_OVERRIDE_LABELS: Record<string, string> = {
  admin: "Admin",
  berita: "Kelola Berita",
  new: "Buat Berita Baru",
  edit: "Edit Berita",
};

/**
 * Mengonversi segmen URL (kebab-case / snake_case) ke label Title Case secara otomatis.
 */
function autoFormatSegment(segment: string): string {
  if (CUSTOM_OVERRIDE_LABELS[segment.toLowerCase()]) {
    return CUSTOM_OVERRIDE_LABELS[segment.toLowerCase()];
  }

  return segment
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function AdminHeader() {
  const pathname = usePathname();

  const getBreadcrumbs = () => {
    const parts = pathname.split("/").filter(Boolean);

    if (parts.length === 1 && parts[0] === "admin") {
      return [
        { label: "Admin", href: "/admin" },
        { label: "Dashboard", href: "/admin" },
      ];
    }

    const items: { label: string; href: string }[] = [];
    let accumulatedPath = "";

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      accumulatedPath += `/${part}`;

      // Skip dynamic ID segments (cuid, uuid, hex, numbers)
      const isId =
        /^[a-z0-9]{20,}$/i.test(part) ||
        /^[0-9a-f-]{10,}$/i.test(part) ||
        /^\d+$/.test(part);

      if (isId) continue;

      const label = autoFormatSegment(part);

      items.push({
        label,
        href: accumulatedPath,
      });
    }

    return items;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border px-4 md:px-6 bg-background">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-vertical:h-4 data-vertical:self-auto"
        />
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((item, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <React.Fragment key={item.href + idx}>
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage className="font-semibold text-foreground">
                        {item.label}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink render={<Link href={item.href} />}>
                        {item.label}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator />}
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
}
