import { ReactNode } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AdminHeader } from "./admin-header";
import { getCurrentUser } from "@/app/actions/auth";
import { prisma } from "@/lib/prisma";

async function getAdminUser() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { name: "Administrator", email: "admin@smktibazma.sch.id", avatar: "" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: currentUser.userId },
      select: { name: true, email: true },
    });

    return {
      name: user?.name || currentUser.name || "Administrator",
      email: user?.email || currentUser.email || "admin@smktibazma.sch.id",
      avatar: "",
    };
  } catch {
    return {
      name: currentUser.name || "Administrator",
      email: currentUser.email || "admin@smktibazma.sch.id",
      avatar: "",
    };
  }
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const adminUser = await getAdminUser();

  return (
    <SidebarProvider>
      <AppSidebar user={adminUser} />
      <SidebarInset className="bg-background min-h-screen flex flex-col">
        <AdminHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}

