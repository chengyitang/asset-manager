import { Asset, AssetCategory } from "@/types"
import { DataTable } from "@/components/assets/data-table"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { stockColumns } from "@/components/assets/stock-columns"
import { stockTWColumns } from "@/components/assets/stock-tw-columns"
import { cryptoColumns } from "@/components/assets/crypto-columns"
import { cashColumns } from "@/components/assets/cash-columns"

const CATEGORY_LABELS: Record<string, string> = {
    "Stock-US": "Stock - US",
    "Stock-TW": "Stock - TW",
    "Crypto": "Crypto",
    "Gold": "Gold",
    "Cash": "Cash",
}

async function getData(category: AssetCategory): Promise<Asset[]> {
    const res = await fetch('http://localhost:3000/api/assets', { cache: 'no-store' });
    if (!res.ok) {
        return [];
    }
    const allAssets: Asset[] = await res.json();

    // Filter by category
    return allAssets.filter(asset => asset.type === category);
}

export default async function AssetCategoryPage({ params }: { params: Promise<{ category: string }> }) {
    const { category } = await params
    const data = await getData(category as AssetCategory)

    let columns
    switch (category) {
        case "Stock-US":
        case "Gold":
            columns = stockColumns
            break
        case "Stock-TW":
            columns = stockTWColumns
            break
        case "Crypto":
            columns = cryptoColumns
            break
        case "Cash":
            columns = cashColumns
            break
        default:
            columns = stockColumns
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center gap-4">
                <Link href="/assets">
                    <Button variant="ghost" size="sm">
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Back to Assets
                    </Button>
                </Link>
            </div>
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">
                    {CATEGORY_LABELS[category] || category}
                </h2>
            </div>
            <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
                <DataTable columns={columns} data={data} hideTypeFilter={true} />
            </div>
        </div>
    )
}
