"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Liability } from "@/types"
import { useCurrency } from "@/contexts/CurrencyContext"
import { EditLiabilityDialog } from "./EditLiabilityDialog"
import { useState } from "react"

export const columns: ColumnDef<Liability>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "type",
        header: "Type",
    },
    {
        accessorKey: "category",
        header: "Category",
    },
    {
        accessorKey: "amount",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Amount
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const { format } = useCurrency()
            const amount = parseFloat(row.getValue("amount"))
            return <div className="font-medium">{format(amount)}</div>
        },
    },
    {
        accessorKey: "interestRate",
        header: "Interest Rate",
        cell: ({ row }) => {
            const rate = parseFloat(row.getValue("interestRate"))
            return <div>{rate.toFixed(2)}%</div>
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            return (
                <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${status === "Active" ? "bg-green-100 text-green-800" :
                        status === "Paid Off" ? "bg-gray-100 text-gray-800" :
                            "bg-yellow-100 text-yellow-800"
                    }`}>
                    {status}
                </div>
            )
        },
    },
    {
        accessorKey: "date",
        header: "Date",
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const liability = row.original
            const [editOpen, setEditOpen] = useState(false)

            const handleDelete = async () => {
                try {
                    const response = await fetch(`/api/liabilities?id=${liability.id}`, {
                        method: "DELETE",
                    })
                    if (response.ok) {
                        window.location.reload()
                    } else {
                        const data = await response.json()
                        console.error("Delete failed:", data)
                        alert(`Failed to delete liability: ${data.error || "Unknown error"}`)
                    }
                } catch (error) {
                    console.error("Error deleting liability:", error)
                    alert("Failed to delete liability. Please check the console for details.")
                }
            }

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
                            <DropdownMenuItem onClick={() => setEditOpen(true)}>
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <EditLiabilityDialog
                        liability={liability}
                        open={editOpen}
                        onOpenChange={setEditOpen}
                    />
                </>
            )
        },
    },
]
