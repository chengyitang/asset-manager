"use client"

import { Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Sidebar } from "@/components/layout/Sidebar"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"

export function MobileSidebar() {
    const [isMounted, setIsMounted] = useState(false)
    const pathname = usePathname()
    const [open, setOpen] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    useEffect(() => {
        setOpen(false)
    }, [pathname])

    if (!isMounted) {
        return null
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 bg-slate-900 border-r-slate-800 text-white">
                <Sidebar />
            </SheetContent>
        </Sheet>
    )
}
