import { DataTable } from "@/components/assets/data-table"
import { columns } from "@/components/liabilities/columns"
import { AddLiabilityDialog } from "@/components/liabilities/AddLiabilityDialog"
import { Liability } from "@/types"

async function getLiabilities(): Promise<Liability[]> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/liabilities`, {
        cache: 'no-store'
    })
    if (!res.ok) return []
    return res.json()
}

export default async function LiabilitiesPage() {
    const liabilities = await getLiabilities()

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Liabilities</h2>
                <AddLiabilityDialog />
            </div>
            <DataTable columns={columns} data={liabilities} />
        </div>
    )
}
