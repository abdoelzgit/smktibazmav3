import DashboardContent from "@/components/ppdb-content"
import { getDashboardPpdbData } from "@/app/actions/ppdb-dashboard"

export default async function Page() {
  const dashboardData = await getDashboardPpdbData();

  return (
    <main className="flex min-w-0 w-full flex-1">
        <DashboardContent
          siswa={dashboardData?.siswa}
          progressItems={dashboardData?.progressItems}
        />
    </main>
  )
}
