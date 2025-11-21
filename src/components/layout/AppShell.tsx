"use client"

import { Sidebar } from "@/components/layout/Sidebar"
import { MobileSidebar } from "@/components/layout/MobileSidebar"
import { useState } from "react"
import { cn } from "@/lib/utils"

export default function AppShell({
    children
}: {
    children: React.ReactNode
}) {
    const [isCollapsed, setIsCollapsed] = useState(false)

    return (
        <div className="h-full relative">
            <div className={cn(
                "hidden h-full md:flex md:flex-col md:fixed md:inset-y-0 z-[80] bg-gray-900 transition-all duration-300",
                isCollapsed ? "md:w-20" : "md:w-72"
            )}>
                <Sidebar isCollapsed={isCollapsed} toggleCollapse={() => setIsCollapsed(!isCollapsed)} />
            </div>
            <main className={cn(
                "pb-10 transition-all duration-300",
                isCollapsed ? "md:pl-20" : "md:pl-72"
            )}>
                <div className="flex items-center p-4 md:hidden">
                    <MobileSidebar />
                </div>
                {children}
            </main>
        </div>
    )
}
