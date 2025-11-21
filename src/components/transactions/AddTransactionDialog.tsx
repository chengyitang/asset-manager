"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const formSchema = z.object({
    date: z.string().min(1, "Date is required"),
    type: z.enum(["Buy", "Sell", "Deposit", "Withdraw"]),
    category: z.enum(["Stock-US", "Stock-TW", "Crypto", "Gold", "Cash"]).default("Stock-US"),
    asset: z.string().min(1, "Asset symbol is required"),
    quantity: z.coerce.number().min(0.000001, "Quantity must be positive").optional(),
    price: z.coerce.number().min(0, "Price must be positive").optional(),
    coinPrice: z.coerce.number().min(0, "Coin price must be positive").optional(),
    totalPaid: z.coerce.number().min(0, "Total paid must be positive").optional(),
    currency: z.enum(["USD", "NTD"]).default("USD"),
}).refine((data) => {
    if (data.category === "Crypto") {
        return data.coinPrice !== undefined && data.totalPaid !== undefined && data.coinPrice > 0 && data.totalPaid > 0;
    } else {
        return data.quantity !== undefined && data.price !== undefined && data.quantity > 0 && data.price > 0;
    }
}, {
    message: "Please fill in all required fields",
    path: ["category"],
})

type FormValues = z.infer<typeof formSchema>

export function AddTransactionDialog() {
    const [open, setOpen] = useState(false)

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            date: "", // Initialize with empty string to avoid hydration mismatch
            type: "Buy",
            category: "Stock-US",
            asset: "",
            quantity: 0,
            price: 0,
            coinPrice: 0,
            totalPaid: 0,
            currency: "USD",
        },
    })

    const category = form.watch("category")
    const currency = form.watch("currency")

    // Set default date on client side
    useEffect(() => {
        form.setValue("date", new Date().toISOString().split("T")[0])
    }, [form])

    // Auto-set quantity to 1 for Cash category
    useEffect(() => {
        if (category === "Cash") {
            form.setValue("quantity", 1)
        }
    }, [category, form])

    async function onSubmit(values: FormValues) {
        try {
            let quantity: number;
            let price: number;

            if (values.category === "Crypto") {
                // For crypto: calculate quantity from total paid and coin price
                quantity = values.totalPaid! / values.coinPrice!;
                price = values.coinPrice!;
            } else {
                // For stocks and others: use direct quantity and price
                quantity = values.quantity!;
                price = values.price!;
            }

            // Prepare transaction data, excluding coinPrice and totalPaid
            const transactionData = {
                date: values.date,
                type: values.type,
                category: values.category,
                asset: values.asset,
                quantity,
                price,
                currency: values.currency || "USD",
                note: "",
            };

            const response = await fetch('/api/transactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(transactionData),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
                console.error("Failed to add transaction:", errorData)
                alert(`Failed to save transaction: ${errorData.error || "Unknown error"}`)
                return
            }

            setOpen(false)
            form.reset()
            // Optional: Refresh data
            window.location.reload()
        } catch (error) {
            console.error(error)
            alert('Failed to save transaction. Please check the console for details.')
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add Transaction
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Transaction</DialogTitle>
                    <DialogDescription>
                        Add a new transaction to your portfolio.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="manual" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                        <TabsTrigger value="upload">Upload Image</TabsTrigger>
                    </TabsList>

                    <TabsContent value="manual">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="date"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Date</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Type</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Buy">Buy</SelectItem>
                                                        <SelectItem value="Sell">Sell</SelectItem>
                                                        <SelectItem value="Deposit">Deposit</SelectItem>
                                                        <SelectItem value="Withdraw">Withdraw</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="category"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Category</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select category" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Stock-US">Stock - US</SelectItem>
                                                        <SelectItem value="Stock-TW">Stock - TW</SelectItem>
                                                        <SelectItem value="Crypto">Crypto</SelectItem>
                                                        <SelectItem value="Gold">Gold</SelectItem>
                                                        <SelectItem value="Cash">Cash</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="currency"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Currency</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select currency" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="USD">USD</SelectItem>
                                                    <SelectItem value="NTD">NTD</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="asset"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{category === "Cash" ? "Account" : "Asset Symbol"}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder={
                                                        category === "Stock-US" ? "e.g. AAPL, MSFT" :
                                                            category === "Stock-TW" ? "e.g. 2330, 006208" :
                                                                category === "Crypto" ? "e.g. BTC, ETH" :
                                                                    category === "Gold" ? "e.g. GC=F" :
                                                                        category === "Cash" ? "e.g. Chase, BOA" :
                                                                            "e.g. USD, TWD"
                                                    }
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {category === "Crypto" ? (
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="coinPrice"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Coin Price ({currency})</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            step="any"
                                                            placeholder="0.00"
                                                            {...field}
                                                            onChange={(e) => {
                                                                field.onChange(e);
                                                                const coinPrice = parseFloat(e.target.value) || 0;
                                                                const totalPaid = form.getValues("totalPaid") || 0;
                                                                if (coinPrice > 0 && totalPaid > 0) {
                                                                    const calculatedQuantity = totalPaid / coinPrice;
                                                                    form.setValue("quantity", calculatedQuantity, { shouldValidate: false });
                                                                }
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="totalPaid"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Total Paid ({currency})</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            step="any"
                                                            placeholder="0.00"
                                                            {...field}
                                                            onChange={(e) => {
                                                                field.onChange(e);
                                                                const totalPaid = parseFloat(e.target.value) || 0;
                                                                const coinPrice = form.getValues("coinPrice") || 0;
                                                                if (coinPrice > 0 && totalPaid > 0) {
                                                                    const calculatedQuantity = totalPaid / coinPrice;
                                                                    form.setValue("quantity", calculatedQuantity, { shouldValidate: false });
                                                                }
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="quantity"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Quantity</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            step="any"
                                                            {...field}
                                                            disabled={category === "Cash"}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="price"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        {category === "Cash" ? "Amount" : "Price per unit"} ({currency})
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input type="number" step="any" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                )}
                                {category === "Crypto" && form.watch("coinPrice") && form.watch("totalPaid") &&
                                    form.watch("coinPrice")! > 0 && form.watch("totalPaid")! > 0 && (
                                        <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                                            Calculated quantity: {(form.watch("totalPaid")! / form.watch("coinPrice")!).toFixed(8)} {form.watch("asset") || "coins"}
                                        </div>
                                    )}
                                <DialogFooter>
                                    <Button type="submit">Save transaction</Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </TabsContent>

                    <TabsContent value="upload" className="space-y-4">
                        <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-10 space-y-4 text-center">
                            <div className="p-4 bg-muted rounded-full">
                                <Plus className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-semibold text-lg">Upload Transaction Image</h3>
                                <p className="text-sm text-muted-foreground">
                                    Upload a screenshot of your transaction record.
                                    <br />
                                    We'll automatically extract the details.
                                </p>
                            </div>
                            <Button variant="outline" className="mt-4">
                                Select Image
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
