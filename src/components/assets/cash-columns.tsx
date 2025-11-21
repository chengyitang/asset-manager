"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Asset } from "@/types"
import { useCurrency } from "@/contexts/CurrencyContext"

const CurrencyCell = ({ value, className }: { value: number, className?: string }) => {
    const { format } = useCurrency()
    return <div className={className}>{format(value)}</div>
}

export const cashColumns: ColumnDef<Asset>[] = [
    {
        accessorKey: "bank", // Use bank field if available, or name as fallback in cell
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Account
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const bank = row.original.bank
            const name = row.original.name
            return <div className="font-medium pl-4">{bank || name}</div>
        },
    },
    {
        accessorKey: "marketValue",
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
        cell: ({ row }) => <CurrencyCell value={parseFloat(row.getValue("marketValue"))} className="font-bold" />,
    },
    {
        accessorKey: "currency",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Currency
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="pl-4">{row.getValue("currency")}</div>,
    },
]
