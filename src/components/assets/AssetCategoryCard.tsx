"use client"

import { AssetCategorySummary } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

interface AssetCategoryCardProps {
    data: AssetCategorySummary
}

const CATEGORY_LABELS: Record<string, string> = {
    "Stock-US": "Stock - US",
    "Stock-TW": "Stock - TW",
    "Crypto": "Crypto",
    "Gold": "Gold",
    "Cash": "Cash",
}

export function AssetCategoryCard({ data }: AssetCategoryCardProps) {
    const changeColor = data.changePercent >= 0 ? "text-green-600" : "text-red-600"
    const changeSign = data.changePercent >= 0 ? "+" : ""

    const formattedValue = new Intl.NumberFormat("en-US", {
        style: "decimal",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(data.totalValue)

    return (
        <Link href={`/assets/${data.category}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 flex-1">
                            <h3 className="text-sm font-semibold">
                                {CATEGORY_LABELS[data.category] || data.category}
                            </h3>
                            <div className="space-y-0.5">
                                <p className="text-lg font-bold">
                                    {formattedValue} {data.currency}
                                </p>
                                <p className={`text-xs font-medium ${changeColor}`}>
                                    {changeSign}{data.changePercent.toFixed(2)}%
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-muted-foreground">
                                {data.weight.toFixed(0)}%
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}
