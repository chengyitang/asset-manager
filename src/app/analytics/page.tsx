import { UnifiedPerformanceChart } from "@/components/analytics/UnifiedPerformanceChart"

export default function AnalyticsPage() {
    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
                <p className="text-muted-foreground">
                    Track your portfolio performance against market benchmarks
                </p>
            </div>

            <div className="space-y-6">
                <UnifiedPerformanceChart />
            </div>
        </div>
    )
}
