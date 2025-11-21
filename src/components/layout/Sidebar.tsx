"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  TrendingUp,
  ArrowLeftRight,
  Settings,
  Coins,
  CreditCard,
  ArrowRightLeft
} from "lucide-react"
import { Button } from "@/components/ui/button"

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
    color: "text-sky-500",
  },
  {
    label: "Assets",
    icon: Coins,
    href: "/assets",
    color: "text-violet-500",
  },
  {
    label: "Liabilities",
    icon: CreditCard,
    href: "/liabilities",
    color: "text-red-500",
  },
  {
    label: "Transactions",
    icon: ArrowLeftRight,
    href: "/transactions",
    color: "text-pink-700",
  },
  {
    label: "Analytics",
    icon: TrendingUp,
    href: "/analytics",
    color: "text-orange-700",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
  },

]

interface SidebarProps {
  isCollapsed?: boolean
  toggleCollapse?: () => void
}

export function Sidebar({ isCollapsed = false, toggleCollapse }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-slate-900 text-white">
      <div className={cn("px-3 py-2 flex-1", isCollapsed ? "px-2" : "px-3")}>
        <div className={cn(
          "flex h-14 items-center border-b mb-4 transition-all duration-300",
          isCollapsed ? "justify-center px-0" : "px-4 lg:px-6"
        )}>
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className={cn("transition-all duration-300", isCollapsed ? "text-xl" : "")}>
              {isCollapsed ? "Λ" : "Λ ≡ Ł + Σ"}
            </span>
          </Link>
        </div>

        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                pathname === route.href ? "text-white bg-white/10" : "text-zinc-400",
                isCollapsed && "justify-center px-2"
              )}
              title={isCollapsed ? route.label : undefined}
            >
              <div className={cn("flex items-center flex-1", isCollapsed && "flex-none justify-center")}>
                <route.icon className={cn("h-5 w-5", route.color, !isCollapsed && "mr-3")} />
                {!isCollapsed && route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {toggleCollapse && (
        <div className={cn("p-3 mt-auto border-t border-white/10", isCollapsed ? "flex justify-center" : "")}>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCollapse}
            className={cn("w-full hover:bg-white/10 hover:text-white", isCollapsed ? "px-0" : "justify-start")}
          >
            {isCollapsed ? (
              <ArrowRightLeft className="h-4 w-4" />
            ) : (
              <>
                <ArrowLeftRight className="h-4 w-4 mr-2" />
                Collapse Sidebar
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
