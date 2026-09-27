import { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';
import { PpdbSidebar } from '@/components/ppdb-sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

async function getPpdbUser() {
  const token = (await cookies()).get('auth_session')?.value;
  const secretKey = process.env.JWT_SECRET;

  if (!token || !secretKey) {
    return { name: 'Pengguna PPDB', email: '', avatar: '' };
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secretKey));
    const userId = typeof payload.userId === 'string' ? payload.userId : '';
    
    let avatar = '';
    if (userId) {
      const pendaftaran = await prisma.pendaftaran.findUnique({
        where: { userId },
        include: { biodata: { select: { fotoFormalUrl: true } } },
      });
      if (pendaftaran?.biodata?.fotoFormalUrl) {
        avatar = pendaftaran.biodata.fotoFormalUrl;
      }
    }

    return {
      name: typeof payload.name === 'string' ? payload.name : 'Pengguna PPDB',
      email: typeof payload.email === 'string' ? payload.email : '',
      avatar,
    };
  } catch {
    return { name: 'Pengguna PPDB', email: '', avatar: '' };
  }
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getPpdbUser();
  
  return (
    <div className="min-h-screen bg-gray-50">
       <SidebarProvider>
      <PpdbSidebar user={user} />
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
                <BreadcrumbItem className=" md:block">
                  <BreadcrumbLink href="./../dashboard-ppdb/dashboard">
                    MENU
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex min-w-0 w-full flex-1 flex-col gap-4 p-4 pt-0">
         {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
    </div>
  );
}