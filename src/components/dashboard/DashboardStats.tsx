"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, TrendingDown, Wallet, CreditCard, ArrowRightLeft } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

interface DashboardData {
    totalAssets: number
    totalLiabilities: number
    netWorth: number
    dailyChange: number
    dailyChangePercent: number
    ytdGrowthPercent: number
}

export function DashboardStats() {
    const [currency, setCurrency] = useState<"USD" | "NTD">("USD")
    const [data, setData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch(`/api/dashboard?currency=${currency}`)
                if (response.ok) {
                    const dashboardData = await response.json()
                    setData(dashboardData)
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [currency])

    const format = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "decimal",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount)
    }

    if (loading) {
        return <div className="text-center py-8">Loading...</div>
    }

    const stats = [
        {
            title: "Total Net Worth",
            value: data?.netWorth || 0,
            trend: (data?.dailyChange || 0) >= 0 ? "up" : "down",
            icon: DollarSign,
            isCurrency: true,
            showChange: true,
            showToggle: true, // Add flag for toggle
        },
        {
            title: "Total Assets",
            value: data?.totalAssets || 0,
            trend: "neutral",
            icon: Wallet,
            isCurrency: true,
            showChange: false,
        },
        {
            title: "Total Liabilities",
            value: data?.totalLiabilities || 0,
            trend: "neutral",
            icon: CreditCard,
            isCurrency: true,
            showChange: false,
        },
        {
            title: "YTD Growth",
            value: data?.ytdGrowthPercent || 0,
            trend: (data?.ytdGrowthPercent || 0) >= 0 ? "up" : "down",
            icon: TrendingUp,
            isCurrency: false,
            isPercent: true,
            showChange: false,
        },
    ]

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
                <Card key={stat.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            {stat.title}
                            {stat.showToggle && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-4 w-4 ml-1 hover:bg-transparent"
                                    onClick={() => setCurrency(currency === "USD" ? "NTD" : "USD")}
                                    title={`Switch to ${currency === "USD" ? "NTD" : "USD"}`}
                                >
                                    <ArrowRightLeft className="h-3 w-3 text-muted-foreground hover:text-primary" />
                                </Button>
                            )}
                        </CardTitle>
                        <stat.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${stat.isPercent ? (stat.trend === "up" ? "text-green-500" : "text-red-500") : ""}`}>
                            {stat.isCurrency && (
                                <span className="text-sm text-muted-foreground mr-1">
                                    {currency === "USD" ? "$" : "NT$"}
                                </span>
                            )}
                            {stat.isCurrency
                                ? format(stat.value as number)
                                : stat.isPercent
                                    ? `${(stat.value as number) >= 0 ? '+' : ''}${(stat.value as number).toFixed(2)}%`
                                    : stat.value}
                        </div>
                        {stat.showChange && (
                            <p className="text-xs text-muted-foreground">
                                <span className="text-black">Daily change: </span>
                                <span className={stat.trend === "up" ? "text-green-500" : "text-red-500"}>
                                    {data ? `${data.dailyChangePercent >= 0 ? '+' : ''}${currency === "USD" ? "$" : "NT$"}${format(Math.abs(data.dailyChange))} (${data.dailyChangePercent >= 0 ? '+' : ''}${data.dailyChangePercent.toFixed(2)}%)` : "0"}
                                </span>
                            </p>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
