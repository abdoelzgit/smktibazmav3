import { ReactNode } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AdminHeader } from "./admin-header";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background min-h-screen flex flex-col">
        <AdminHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
