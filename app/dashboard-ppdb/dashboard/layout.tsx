import { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { PpdbSidebar } from '@/components/ppdb-sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

async function getPpdbUser() {
  const token = (await cookies()).get('admin_session')?.value;
  const secretKey = process.env.JWT_SECRET;

  if (!token || !secretKey) {
    return { name: 'Pengguna PPDB', email: '', avatar: '' };
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secretKey));

    return {
      name: typeof payload.name === 'string' ? payload.name : 'Pengguna PPDB',
      email: typeof payload.email === 'string' ? payload.email : '',
      avatar: '',
    };
  } catch {
    return { name: 'Pengguna PPDB', email: '', avatar: '' };
  }
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
       <SidebarProvider>
      <PpdbSidebar user={await getPpdbUser()} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Build Your Application
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
         {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
    </div>
  );
}
