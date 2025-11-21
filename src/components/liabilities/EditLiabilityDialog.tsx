"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
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
import { Liability } from "@/types"

const formSchema = z.object({
    date: z.string().min(1, "Date is required"),
    type: z.enum(["Loan", "Credit Card", "Mortgage", "Other"]),
    category: z.string().min(1, "Category is required"),
    name: z.string().min(1, "Name is required"),
    amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Amount must be a positive number",
    }),
    interestRate: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
        message: "Interest rate must be a non-negative number",
    }),
    status: z.enum(["Active", "Paid Off", "Pending"]),
    note: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface EditLiabilityDialogProps {
    liability: Liability
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function EditLiabilityDialog({ liability, open, onOpenChange }: EditLiabilityDialogProps) {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            date: liability.date,
            type: liability.type,
            category: liability.category,
            name: liability.name,
            amount: liability.amount.toString(),
            interestRate: liability.interestRate.toString(),
            status: liability.status,
            note: liability.note || "",
        },
    })

    // Reset form when liability changes
    useEffect(() => {
        form.reset({
            date: liability.date,
            type: liability.type,
            category: liability.category,
            name: liability.name,
            amount: liability.amount.toString(),
            interestRate: liability.interestRate.toString(),
            status: liability.status,
            note: liability.note || "",
        })
    }, [liability, form])

    async function onSubmit(values: FormValues) {
        try {
            const response = await fetch("/api/liabilities", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: liability.id,
                    ...values,
                    amount: parseFloat(values.amount),
                    interestRate: parseFloat(values.interestRate),
                }),
            })

            if (response.ok) {
                onOpenChange(false)
                window.location.reload()
            }
        } catch (error) {
            console.error("Error updating liability:", error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle>Edit Liability</DialogTitle>
                    <DialogDescription>
                        Update the liability information.
                    </DialogDescription>
                </DialogHeader>
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
                                            <SelectItem value="Loan">Loan</SelectItem>
                                            <SelectItem value="Credit Card">Credit Card</SelectItem>
                                            <SelectItem value="Mortgage">Mortgage</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
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
                                    <FormControl>
                                        <Input placeholder="e.g., Personal, Business, Auto" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Chase Credit Card" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Amount</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" placeholder="0.00" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="interestRate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Interest Rate (%)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" placeholder="0.00" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Active">Active</SelectItem>
                                            <SelectItem value="Paid Off">Paid Off</SelectItem>
                                            <SelectItem value="Pending">Pending</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
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
