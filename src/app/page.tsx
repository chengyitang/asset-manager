import { DashboardStats } from "@/components/dashboard/DashboardStats"
import { AssetAllocationChart } from "@/components/dashboard/AssetAllocationChart"
import { RecentTransactions } from "@/components/dashboard/RecentTransactions"
import { FinanceNews } from "@/components/dashboard/FinanceNews"

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="space-y-4">
        <DashboardStats />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <AssetAllocationChart />
          <RecentTransactions />
        </div>
        <FinanceNews />
      </div>
    </div>
  )
}
