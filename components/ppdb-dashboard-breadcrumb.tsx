"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

const pageNames: Record<string, string> = {
  "/ppdb/dashboard": "Beranda",
  "/ppdb/dashboard/pendaftaran": "Formulir Pendaftaran",
};

export function PpdbDashboardBreadcrumb() {
  const pathname = usePathname();
  const currentName = pageNames[pathname] ?? "Dashboard";
  const isHome = pathname === "/ppdb/dashboard";

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          {isHome ? <BreadcrumbPage>Beranda</BreadcrumbPage> : <BreadcrumbLink render={<Link href="/ppdb/dashboard" />}>Beranda</BreadcrumbLink>}
        </BreadcrumbItem>
        {!isHome && <>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>{currentName}</BreadcrumbPage></BreadcrumbItem>
        </>}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
