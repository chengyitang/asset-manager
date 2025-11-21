"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCurrency } from "@/contexts/CurrencyContext"
import { useEffect, useState } from "react"
import { Transaction } from "@/types"

export function RecentTransactions() {
    const { format } = useCurrency()
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchTransactions() {
            try {
                const response = await fetch('/api/transactions')
                if (response.ok) {
                    const data = await response.json()
                    // Sort by date descending and take the most recent 5
                    const sorted = data
                        .sort((a: Transaction, b: Transaction) => 
                            new Date(b.date).getTime() - new Date(a.date).getTime()
                        )
                        .slice(0, 5)
                    setTransactions(sorted)
                }
            } catch (error) {
                console.error('Error fetching transactions:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchTransactions()
    }, [])

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        })
    }

    if (loading) {
        return (
            <Card className="col-span-4 md:col-span-2 lg:col-span-2">
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">Loading...</div>
                </CardContent>
            </Card>
        )
    }

    if (transactions.length === 0) {
        return (
            <Card className="col-span-4 md:col-span-2 lg:col-span-2">
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">No transactions found</div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="col-span-4 md:col-span-2 lg:col-span-2">
            <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Asset</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.map((transaction) => (
                            <TableRow key={transaction.id}>
                                <TableCell className="font-medium">
                                    {transaction.assetName || transaction.asset}
                                </TableCell>
                                <TableCell>{transaction.type}</TableCell>
                                <TableCell>{formatDate(transaction.date)}</TableCell>
                                <TableCell className="text-right">
                                    {format(transaction.total)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
