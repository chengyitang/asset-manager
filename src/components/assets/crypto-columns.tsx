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

export const cryptoColumns: ColumnDef<Asset>[] = [
    {
        accessorKey: "symbol",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Coin
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="flex flex-col pl-4">
                <span className="font-medium">{row.original.name}</span>
                <span className="text-xs text-muted-foreground">{row.original.symbol}</span>
            </div>
        ),
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
        cell: ({ row }) => <CurrencyCell value={parseFloat(row.getValue("price"))} />,
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
        cell: ({ row }) => <CurrencyCell value={parseFloat(row.getValue("avgCost"))} />,
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
        accessorKey: "weight",
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
        cell: ({ row }) => <PercentCell value={parseFloat(row.getValue("weight"))} />,
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
