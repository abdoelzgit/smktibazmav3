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
import { Home, DatabaseSearch, Newspaper, AppWindow } from "lucide-react"

const defaultUser = {
  name: "Admin SMK TI BAZMA",
  email: "admin@smktibazma.sch.id",
  avatar: "",
}

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: (
        <Home/>
      ),
      isActive: true,
    },
    {
      title: "Berita",
      url: "/admin/berita",
      icon: (
        <Newspaper
        />
      ),
      isActive: true,
    },{
      title: "Jejak Karya",
      url: "/admin/jejak-karya",
      icon: (
        <AppWindow/>
      )
    },{
      title: "Data PPDB",
      url: "/admin/data-ppdb",
      icon: (
        <DatabaseSearch />
      )
    }
  ],
}

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  user?: {
    name?: string
    email?: string
    avatar?: string
  }
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const activeUser = {
    name: user?.name || defaultUser.name,
    email: user?.email || defaultUser.email,
    avatar: user?.avatar || defaultUser.avatar,
  }

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<a href="/admin" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg  text-sidebar-primary-foreground">
                <img src="/images/logo.avif" alt="Logo SMK TI BAZMA" className="size-8 object-contain" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">SMK TI BAZMA</span>
                <span className="truncate text-xs">Admin</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={activeUser} />
      </SidebarFooter>
    </Sidebar>
  )
}

