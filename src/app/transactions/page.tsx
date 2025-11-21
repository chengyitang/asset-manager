import { columns } from "@/components/transactions/columns"
import { Transaction } from "@/types"
import { DataTable } from "@/components/assets/data-table"
import { AddTransactionDialog } from "@/components/transactions/AddTransactionDialog"

async function getData(): Promise<Transaction[]> {
    const res = await fetch('http://localhost:3000/api/transactions', { cache: 'no-store' });
    if (!res.ok) {
        // Handle error or return empty
        return [];
    }
    return res.json();
}

export default async function TransactionsPage() {
    const data = await getData()

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
                <AddTransactionDialog />
            </div>
            <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
                <DataTable columns={columns} data={data} enableDateRangeFilter={true} />
            </div>
        </div>
    )
}
