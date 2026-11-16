"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

const pageNames: Record<string, string> = {
  "/spmb/dashboard": "Beranda",
  "/spmb/form": "Formulir Pendaftaran",
};

export function PpdbDashboardBreadcrumb() {
  const pathname = usePathname();
  const currentName = pageNames[pathname] ?? "Dashboard";
  const isHome = pathname === "/spmb/dashboard";

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          {isHome ? <BreadcrumbPage>Dashboard</BreadcrumbPage> : <BreadcrumbLink render={<Link href="/spmb/dashboard" />}>Dashboard</BreadcrumbLink>}
        </BreadcrumbItem>
        {!isHome && <>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>{currentName}</BreadcrumbPage></BreadcrumbItem>
        </>}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
