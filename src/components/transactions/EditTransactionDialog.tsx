"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Transaction } from "@/types"

const formSchema = z.object({
    date: z.string().min(1, "Date is required"),
    type: z.enum(["Buy", "Sell", "Deposit", "Withdraw"]),
    category: z.enum(["Stock-US", "Stock-TW", "Crypto", "Gold", "Cash"]),
    asset: z.string().min(1, "Asset is required"),
    quantity: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Quantity must be a positive number",
    }).optional(),
    price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Price must be a positive number",
    }).optional(),
    coinPrice: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Coin price must be a positive number",
    }).optional(),
    totalPaid: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Total paid must be a positive number",
    }).optional(),
    note: z.string().optional(),
    currency: z.enum(["USD", "NTD"]).default("USD"),
}).refine((data) => {
    if (data.category === "Crypto") {
        return data.coinPrice && data.totalPaid &&
            !isNaN(Number(data.coinPrice)) && Number(data.coinPrice) > 0 &&
            !isNaN(Number(data.totalPaid)) && Number(data.totalPaid) > 0;
    } else {
        return data.quantity && data.price &&
            !isNaN(Number(data.quantity)) && Number(data.quantity) > 0 &&
            !isNaN(Number(data.price)) && Number(data.price) > 0;
    }
}, {
    message: "Please fill in all required fields",
    path: ["category"],
})

type FormValues = z.infer<typeof formSchema>

interface EditTransactionDialogProps {
    transaction: Transaction
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function EditTransactionDialog({ transaction, open, onOpenChange }: EditTransactionDialogProps) {
    const isCrypto = transaction.category === "Crypto";
    const initialCoinPrice = isCrypto ? transaction.price.toString() : "";
    const initialTotalPaid = isCrypto ? (transaction.quantity * transaction.price).toString() : "";

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            date: transaction.date,
            type: transaction.type,
            category: transaction.category,
            asset: transaction.asset,
            quantity: isCrypto ? "" : transaction.quantity.toString(),
            price: isCrypto ? "" : transaction.price.toString(),
            coinPrice: initialCoinPrice,
            totalPaid: initialTotalPaid,
            note: transaction.note || "",
            currency: (transaction.currency as "USD" | "NTD") || "USD",
        },
    })

    const category = form.watch("category");
    const currency = form.watch("currency");

    // Reset form when transaction changes
    useEffect(() => {
        const isCrypto = transaction.category === "Crypto";
        const initialCoinPrice = isCrypto ? transaction.price.toString() : "";
        const initialTotalPaid = isCrypto ? (transaction.quantity * transaction.price).toString() : "";

        form.reset({
            date: transaction.date,
            type: transaction.type,
            category: transaction.category,
            asset: transaction.asset,
            quantity: isCrypto ? "" : transaction.quantity.toString(),
            price: isCrypto ? "" : transaction.price.toString(),
            coinPrice: initialCoinPrice,
            totalPaid: initialTotalPaid,
            note: transaction.note || "",
            currency: (transaction.currency as "USD" | "NTD") || "USD",
        })
    }, [transaction, form])

    // Auto-set quantity to 1 for Cash category
    useEffect(() => {
        if (category === "Cash") {
            form.setValue("quantity", "1");
        }
    }, [category, form]);

    async function onSubmit(values: FormValues) {
        try {
            let quantity: number;
            let price: number;

            if (values.category === "Crypto") {
                // For crypto: calculate quantity from total paid and coin price
                quantity = parseFloat(values.totalPaid!) / parseFloat(values.coinPrice!);
                price = parseFloat(values.coinPrice!);
            } else {
                // For stocks and others: use direct quantity and price
                quantity = parseFloat(values.quantity!);
                price = parseFloat(values.price!);
            }

            // Prepare update data, excluding coinPrice and totalPaid
            const updateData = {
                id: transaction.id,
                date: values.date,
                type: values.type,
                category: values.category,
                asset: values.asset,
                quantity,
                price,
                currency: values.currency || "USD",
                note: values.note || "",
                status: transaction.status || "Completed",
            };

            console.log("Submitting update:", updateData);

            const response = await fetch("/api/transactions", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updateData),
            })

            if (response.ok) {
                toast.success("Transaction updated successfully")
                onOpenChange(false)
                window.location.reload()
            } else {
                const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
                console.error("Failed to update transaction:", errorData)
                toast.error(`Failed to update transaction: ${errorData.error || "Unknown error"}`)
            }
        } catch (error) {
            console.error("Error updating transaction:", error)
            toast.error("Failed to update transaction. Please check the console for details.")
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle>Edit Transaction</DialogTitle>
                    <DialogDescription>
                        Update the transaction information.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
                        console.error("Form validation errors:", JSON.stringify(errors, null, 2))
                        toast.error("Please check the form for errors")
                    })} className="space-y-4">
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
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Type</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
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
                                    <Select onValueChange={field.onChange} value={field.value}>
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
                        <FormField
                            control={form.control}
                            name="asset"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{category === "Cash" ? "Account" : "Asset Symbol"}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={category === "Cash" ? "e.g. Chase, BOA" : "e.g., AAPL, BTC"} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="currency"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Currency</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
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
                                                        const totalPaid = parseFloat(form.getValues("totalPaid") || "0") || 0;
                                                        if (coinPrice > 0 && totalPaid > 0) {
                                                            const calculatedQuantity = totalPaid / coinPrice;
                                                            form.setValue("quantity", calculatedQuantity.toString(), { shouldValidate: false });
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
                                                        const coinPrice = parseFloat(form.getValues("coinPrice") || "0") || 0;
                                                        if (coinPrice > 0 && totalPaid > 0) {
                                                            const calculatedQuantity = totalPaid / coinPrice;
                                                            form.setValue("quantity", calculatedQuantity.toString(), { shouldValidate: false });
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
                                                    step="0.01"
                                                    placeholder="0"
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
                                            <FormLabel>{category === "Cash" ? "Amount" : `Price (${currency})`}</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.01" placeholder="0.00" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}
                        {category === "Crypto" && form.watch("coinPrice") && form.watch("totalPaid") &&
                            parseFloat(form.watch("coinPrice") || "0") > 0 && parseFloat(form.watch("totalPaid") || "0") > 0 && (
                                <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                                    Calculated quantity: {(parseFloat(form.watch("totalPaid") || "0") / parseFloat(form.watch("coinPrice") || "1")).toFixed(8)} {form.watch("asset") || "coins"}
                                </div>
                            )}
                        <FormField
                            control={form.control}
                            name="note"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Note (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Additional notes..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit">Save Changes</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
