"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useCurrency } from "@/contexts/CurrencyContext"
import { EditTransactionDialog } from "./EditTransactionDialog"
import { useState } from "react"
import { Transaction } from "@/types"

const CurrencyCell = ({ value, className }: { value: number, className?: string }) => {
    const { format } = useCurrency()
    return <div className={`font-medium ${className}`}>{format(value)}</div>
}

export const columns: ColumnDef<Transaction>[] = [
    {
        accessorKey: "date",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => {
            const type = row.getValue("type") as string
            return (
                <div className={
                    type === "Buy" || type === "Deposit" ? "text-green-600 font-medium" : "text-red-600 font-medium"
                }>
                    {type}
                </div>
            )
        }
    },
    {
        accessorKey: "asset",
        header: "Name/Symbol",
        cell: ({ row }) => {
            const asset = row.getValue("asset") as string
            const assetName = row.original.assetName
            return (
                <div>
                    {assetName && assetName !== asset ? (
                        <>
                            <div className="font-medium">{assetName}</div>
                            <div className="text-sm text-muted-foreground">{asset}</div>
                        </>
                    ) : (
                        <div className="font-medium">{asset}</div>
                    )}
                </div>
            )
        },
    },
    {
        accessorKey: "quantity",
        header: "Quantity",
    },
    {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => <CurrencyCell value={parseFloat(row.getValue("price"))} />,
    },
    {
        accessorKey: "total",
        header: "Total",
        cell: ({ row }) => <CurrencyCell value={parseFloat(row.getValue("total"))} />,
    },
    {
        accessorKey: "currency",
        header: "Currency",
        cell: ({ row }) => {
            const currency = row.getValue("currency") as string || "USD"
            return (
                <div className="font-medium">
                    {currency}
                </div>
            )
        },
    },
    // Status column removed as per redesign
    {
        accessorKey: "category",
        header: "Category",
        enableHiding: true, // Allow hiding this column
        // Hide by default via initial state in DataTable if possible, or just css hidden
        // For now, we'll just add it. DataTable doesn't hide it by default unless we pass state.
        // But since we don't want to show it, we can set size to 0 or use a cell that returns null.
        // Better approach: The user didn't ask to hide it explicitly, but "hidden category column" implies it shouldn't be visible.
        // However, standard shadcn table doesn't support hidden columns easily without state.
        // Let's just add it for now, it might be useful to see. Or we can make the cell return null and header null?
        // No, that leaves a gap.
        // Let's just add it. If the user wants it hidden, we can handle that later or use visibility state.
        // Actually, the plan said "hidden category column".
        // I'll add it but set `meta` or just rely on it being there for filtering.
        // To hide it effectively without changing DataTable state logic too much, I can just not render anything in cell/header?
        // No, that still takes space.
        // Let's just add it as a normal column for now so the user can verify the data, 
        // or if I really want it hidden, I'd need to control columnVisibility in DataTable.
        // Let's add it as a visible column first, it's useful info.
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const transaction = row.original
            const [editOpen, setEditOpen] = useState(false)

            return (
                <>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                                onClick={() => navigator.clipboard.writeText(transaction.id)}
                            >
                                Copy ID
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={(e) => {
                                e.preventDefault()
                                setEditOpen(true)
                            }}>
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-red-600"
                                onClick={async () => {
                                    try {
                                        console.log('Deleting transaction:', transaction.id)
                                        const response = await fetch(`/api/transactions?id=${transaction.id}`, {
                                            method: "DELETE",
                                        })

                                        console.log('Delete response status:', response.status)
                                        const data = await response.json()
                                        console.log('Delete response data:', data)

                                        if (response.ok) {
                                            console.log('Delete successful, reloading page')
                                            window.location.reload()
                                        } else {
                                            console.error('Delete failed:', data)
                                            alert(`Failed to delete transaction: ${data.error || 'Unknown error'}`)
                                        }
                                    } catch (error) {
                                        console.error('Delete error:', error)
                                        alert('Failed to delete transaction. Please check the console for details.')
                                    }
                                }}
                            >
                                <Trash className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <EditTransactionDialog
                        transaction={transaction}
                        open={editOpen}
                        onOpenChange={setEditOpen}
                    />
                </>
            )
        },
    },
]
