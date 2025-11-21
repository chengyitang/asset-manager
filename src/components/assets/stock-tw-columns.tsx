"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Asset } from "@/types"

// Custom cell for NTD formatting
const NTDCell = ({ value, className }: { value: number, className?: string }) => {
    const formatted = new Intl.NumberFormat("en-US", {
        style: "decimal",
        minimumFractionDigits: 0, // NTD usually doesn't need decimals for stock prices
        maximumFractionDigits: 2,
    }).format(value)
    return <div className={className}>{formatted}</div>
}

const PercentCell = ({ value, className }: { value: number, className?: string }) => {
    return <div className={className}>{value.toFixed(2)}%</div>
}

export const stockTWColumns: ColumnDef<Asset>[] = [
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
        cell: ({ row }) => <div className="pl-4">{row.getValue("name")}</div>,
    },
    {
        accessorKey: "originalPrice",
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
        cell: ({ row }) => <div>{(row.original.originalPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>,
    },
    {
        accessorKey: "originalCost",
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
        cell: ({ row }) => <div>{(row.original.originalCost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>,
    },
    {
        accessorKey: "quantity",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Quantity
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div>{row.getValue<number>("quantity").toLocaleString()}</div>,
    },
    {
        accessorKey: "originalChange",
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
            const amount = row.original.originalChange || 0
            const colorClass = amount >= 0 ? "text-green-600" : "text-red-600"
            // Simple number formatting without currency prefix
            return <div className={colorClass}>{amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
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
        accessorKey: "originalUnrealizedPL",
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
            const amount = row.original.originalUnrealizedPL || 0
            const colorClass = amount >= 0 ? "text-green-600" : "text-red-600"
            return <NTDCell value={amount} className={colorClass} />
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
        accessorKey: "categoryWeight", // Use categoryWeight instead of weight
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
        cell: ({ row }) => <PercentCell value={row.original.categoryWeight || 0} />,
    },
    {
        accessorKey: "originalValue",
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
        cell: ({ row }) => <NTDCell value={row.original.originalValue || 0} />,
    },
]
