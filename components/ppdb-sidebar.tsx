"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { House, FolderInput, BellRing, TerminalIcon } from "lucide-react"

const data = {
  navMain: [
    {
      title: "Beranda",
      url: "/dashboard-ppdb/dashboard",
      icon: (
        <House />
      ),
      isActive: true,
    },{
      title: "Formulir Pendaftaran",
      url: "/dashboard-ppdb/dashboard/pendaftaran",
      icon: (
        <FolderInput />
      )
    }
    ,{
      title: "Pengumuman",
      url: "/admin/jejak-karya",
      icon: (
        <BellRing />
      )
    }

  ],
 
 
}
type PpdbSidebarUser = {
  name: string;
  email: string;
  avatar: string;
};

export function PpdbSidebar({ user, ...props }: React.ComponentProps<typeof Sidebar> & { user: PpdbSidebarUser }) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<a href="#" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg  text-sidebar-primary-foreground">
                <img src="/images/logo.avif" alt="Logo SMK TI BAZMA" className="size-8 object-contain" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">SMK TI BAZMA</span>
                <span className="truncate text-xs">Calon Siswa</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
