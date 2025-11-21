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

const PercentCell = ({ value, className }: { value: number, className?: string }) => {
    return <div className={className}>{value.toFixed(2)}%</div>
}

export const stockColumns: ColumnDef<Asset>[] = [
    {
        accessorKey: "symbol",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Symbol
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="font-medium pl-4">{row.getValue("symbol")}</div>,
    },
    {
        accessorKey: "price",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Price
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div>{parseFloat(row.getValue("price")).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>,
    },
    {
        accessorKey: "avgCost",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Cost
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div>{parseFloat(row.getValue("avgCost")).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>,
    },
    {
        accessorKey: "quantity",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Shares
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div>{row.getValue<number>("quantity").toLocaleString()}</div>,
    },
    {
        accessorKey: "change",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Change
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("change"))
            const colorClass = amount >= 0 ? "text-green-600" : "text-red-600"
            return <CurrencyCell value={amount} className={colorClass} />
        },
    },
    {
        accessorKey: "change24h",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Change %
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("change24h"))
            const colorClass = amount >= 0 ? "text-green-600" : "text-red-600"
            return <PercentCell value={amount} className={colorClass} />
        },
    },
    {
        accessorKey: "unrealizedPL",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Total Change
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("unrealizedPL"))
            const colorClass = amount >= 0 ? "text-green-600" : "text-red-600"
            return <CurrencyCell value={amount} className={colorClass} />
        },
    },
    {
        accessorKey: "totalChangePercentage",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Total Change %
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("totalChangePercentage"))
            const colorClass = amount >= 0 ? "text-green-600" : "text-red-600"
            return <PercentCell value={amount} className={colorClass} />
        },
    },
    {
        accessorKey: "categoryWeight",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Weight
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <PercentCell value={parseFloat(row.getValue("categoryWeight"))} />,
    },
    {
        accessorKey: "marketValue",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Value
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <CurrencyCell value={parseFloat(row.getValue("marketValue"))} />,
    },
]
