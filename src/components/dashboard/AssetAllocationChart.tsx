"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { useEffect, useState } from "react"
import { useCurrency } from "@/contexts/CurrencyContext"

interface AssetData {
    name: string
    value: number
    color: string
    [key: string]: string | number
}

const COLORS = {
    "Stock-US": "#4A70A9",
    "Stock-TW": "#000000",
    Gold: "#FCB53B",
    Crypto: "#ABE7B2",
    Cash: "#C4A484",
    Other: "#57595B",
}

export function AssetAllocationChart() {
    const { currency } = useCurrency()
    const [data, setData] = useState<AssetData[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchAssets() {
            try {
                const response = await fetch('/api/assets')
                if (response.ok) {
                    const assets = await response.json()

                    // Group assets by type and sum their market values
                    const grouped: Record<string, number> = {}

                    assets.forEach((asset: any) => {
                        const type = asset.type || 'Other'
                        const marketValue = asset.marketValue || 0
                        grouped[type] = (grouped[type] || 0) + marketValue
                    })

                    // Convert to chart data format
                    const chartData: AssetData[] = Object.entries(grouped).map(([name, value]) => ({
                        name,
                        value,
                        color: COLORS[name as keyof typeof COLORS] || "#999999",
                    }))

                    setData(chartData)
                }
            } catch (error) {
                console.error('Error fetching assets:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchAssets()
    }, [currency]) // Refetch when currency changes

    if (loading) {
        return (
            <Card className="col-span-4 md:col-span-2 lg:col-span-2">
                <CardHeader>
                    <CardTitle>Asset Allocation</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">Loading...</div>
                </CardContent>
            </Card>
        )
    }

    if (data.length === 0) {
        return (
            <Card className="col-span-4 md:col-span-2 lg:col-span-2">
                <CardHeader>
                    <CardTitle>Asset Allocation</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">No assets found</div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="col-span-4 md:col-span-2 lg:col-span-2">
            <CardHeader>
                <CardTitle>Asset Allocation</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: number) => `${currency === 'USD' ? '$' : 'NT$'}${value.toLocaleString()}`}
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
