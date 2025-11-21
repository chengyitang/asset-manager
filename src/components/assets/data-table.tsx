"use client"

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getSortedRowModel,
    SortingState,
    getFilteredRowModel,
    ColumnFiltersState,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useMemo, useState, type ReactNode } from "react"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useCurrency } from "@/contexts/CurrencyContext"

import { DateRangePicker } from "@/components/ui/date-range-picker"
import { DateRange } from "react-day-picker"
import { isWithinInterval, parseISO, startOfDay, endOfDay } from "date-fns"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    hideTypeFilter?: boolean
    enableDateRangeFilter?: boolean
}

export function DataTable<TData, TValue>({
    columns,
    data,
    hideTypeFilter = false,
    enableDateRangeFilter = false,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [dateRange, setDateRange] = useState<DateRange | undefined>()
    const { format } = useCurrency()

    // Filter data based on date range if enabled
    const filteredData = useMemo(() => {
        if (!enableDateRangeFilter || !dateRange?.from) return data

        return data.filter((item: any) => {
            if (!item.date) return true
            const itemDate = parseISO(item.date)

            if (dateRange.to) {
                return isWithinInterval(itemDate, {
                    start: startOfDay(dateRange.from!),
                    end: endOfDay(dateRange.to)
                })
            } else {
                // If only start date is selected, match that specific day
                const startDate = startOfDay(dateRange.from!)
                const endDate = endOfDay(dateRange.from!)
                return isWithinInterval(itemDate, { start: startDate, end: endDate })
            }
        })
    }, [data, enableDateRangeFilter, dateRange])

    const table = useReactTable({
        data: filteredData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            columnFilters,
        },
    })

    // Check which columns exist
    const hasSymbolColumn = columns.some((col: any) => col.accessorKey === "symbol")
    const hasAssetColumn = columns.some((col: any) => col.accessorKey === "asset")
    const hasTypeColumn = columns.some((col: any) => col.accessorKey === "type")
    const hasCategoryColumn = columns.some((col: any) => col.accessorKey === "category")

    // Determine keys for total calculation
    const totalChangeKey = columns.some((col: any) => col.accessorKey === "originalUnrealizedPL")
        ? "originalUnrealizedPL"
        : "unrealizedPL"
    const hasTotalChangeColumn = columns.some((col: any) => col.accessorKey === totalChangeKey)

    const hasTotalChangePercentageColumn = columns.some(
        (col: any) => col.accessorKey === "totalChangePercentage"
    )

    const valueColumnKey = columns.some((col: any) => col.accessorKey === "originalValue")
        ? "originalValue"
        : columns.some((col: any) => col.accessorKey === "marketValue")
            ? "marketValue"
            : "value"
    const hasValueColumn = columns.some((col: any) => col.accessorKey === valueColumnKey)

    const showTotalsRow = hasTotalChangeColumn && hasTotalChangePercentageColumn && hasValueColumn

    const filteredRows = table.getRowModel().rows

    const totals = useMemo(() => {
        if (!showTotalsRow) {
            return {
                totalChange: 0,
                totalChangePct: 0,
                totalValue: 0,
            }
        }

        const parseNumber = (value: unknown) => {
            if (typeof value === "number") {
                return Number.isFinite(value) ? value : 0
            }

            if (typeof value === "string") {
                const parsed = parseFloat(value)
                return Number.isFinite(parsed) ? parsed : 0
            }

            return 0
        }

        const { totalChange, totalValue } = filteredRows.reduce(
            (acc, row) => {
                const original = row.original as Record<string, unknown>
                const change = parseNumber(original[totalChangeKey] ?? row.getValue(totalChangeKey))
                const value = parseNumber(
                    original[valueColumnKey] ?? row.getValue(valueColumnKey as string)
                )

                acc.totalChange += change
                acc.totalValue += value

                return acc
            },
            { totalChange: 0, totalValue: 0 }
        )

        const totalCost = totalValue - totalChange
        const totalChangePct = totalCost > 0 ? (totalChange / totalCost) * 100 : 0

        return {
            totalChange,
            totalValue,
            totalChangePct,
        }
    }, [filteredRows, showTotalsRow, valueColumnKey, totalChangeKey])

    // Use category column for filtering if available, otherwise fall back to type (for Assets table)
    const filterColumn = hasCategoryColumn ? "category" : "type"
    const hasFilterColumn = hasCategoryColumn || hasTypeColumn

    return (
        <div>
            <div className="flex items-center gap-4 py-4 flex-wrap">
                {enableDateRangeFilter && (
                    <DateRangePicker date={dateRange} setDate={setDateRange} />
                )}
                {hasSymbolColumn && (
                    <Input
                        placeholder="Search"
                        value={(table.getColumn("symbol")?.getFilterValue() as string) ?? ""}
                        onChange={(event) =>
                            table.getColumn("symbol")?.setFilterValue(event.target.value)
                        }
                        className="max-w-sm"
                    />
                )}
                {hasAssetColumn && (
                    <Input
                        placeholder="Search"
                        value={(table.getColumn("asset")?.getFilterValue() as string) ?? ""}
                        onChange={(event) =>
                            table.getColumn("asset")?.setFilterValue(event.target.value)
                        }
                        className="max-w-sm"
                    />
                )}
                {hasFilterColumn && !hideTypeFilter && (
                    <Select
                        value={(table.getColumn(filterColumn)?.getFilterValue() as string) ?? "all"}
                        onValueChange={(value) =>
                            table.getColumn(filterColumn)?.setFilterValue(value === "all" ? "" : value)
                        }
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="Stock-US">Stock - US</SelectItem>
                            <SelectItem value="Stock-TW">Stock - TW</SelectItem>
                            <SelectItem value="Crypto">Crypto</SelectItem>
                            <SelectItem value="Gold">Gold</SelectItem>
                            <SelectItem value="Cash">Cash</SelectItem>
                        </SelectContent>
                    </Select>
                )}
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                    {showTotalsRow && (
                        <TableFooter>
                            <TableRow>
                                {(() => {
                                    let labelPlaced = false
                                    return table.getVisibleLeafColumns().map((column) => {
                                        const columnId =
                                            column.id ?? column.columnDef.id ?? (column.columnDef as any).accessorKey
                                        let content: ReactNode = ""
                                        let className = "font-bold" // Always bold for total row

                                        const shouldShowLabel =
                                            !labelPlaced &&
                                            (columnId === "symbol" ||
                                                columnId === "asset" ||
                                                columnId === "name")

                                        if (shouldShowLabel) {
                                            content = "Total"
                                            labelPlaced = true
                                        } else if (
                                            columnId === totalChangeKey ||
                                            columnId === "totalChangeValue"
                                        ) {
                                            // Format based on currency type (NTD for Stock-TW, USD for others)
                                            // Since we don't have easy access to currency context here for specific row logic,
                                            // we can infer from the key.
                                            if (totalChangeKey === "originalUnrealizedPL") {
                                                // Stock-TW: NTD
                                                content = new Intl.NumberFormat("en-US", {
                                                    style: "decimal",
                                                    minimumFractionDigits: 0,
                                                    maximumFractionDigits: 2,
                                                }).format(totals.totalChange)
                                            } else {
                                                content = format(totals.totalChange)
                                            }

                                            className +=
                                                totals.totalChange >= 0
                                                    ? " text-green-600"
                                                    : " text-red-600"
                                        } else if (
                                            columnId === "totalChangePercentage" ||
                                            columnId === "totalChangePct"
                                        ) {
                                            content = `${totals.totalChangePct.toFixed(2)}%`
                                            className +=
                                                totals.totalChangePct >= 0
                                                    ? " text-green-600"
                                                    : " text-red-600"
                                        } else if (columnId === valueColumnKey) {
                                            if (valueColumnKey === "originalValue") {
                                                // Stock-TW: NTD
                                                content = new Intl.NumberFormat("en-US", {
                                                    style: "decimal",
                                                    minimumFractionDigits: 0,
                                                    maximumFractionDigits: 2,
                                                }).format(totals.totalValue)
                                            } else {
                                                content = format(totals.totalValue)
                                            }
                                        }

                                        return (
                                            <TableCell key={column.id} className={className}>
                                                {content}
                                            </TableCell>
                                        )
                                    })
                                })()}
                            </TableRow>
                        </TableFooter>
                    )}
                </Table>
            </div>
        </div>
    )
}
