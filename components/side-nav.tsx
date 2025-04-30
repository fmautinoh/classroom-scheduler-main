"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BarChart3, CalendarDays, FileBarChart, Settings, School } from "lucide-react"

export function SideNav() {
  const pathname = usePathname()

  return (
    <nav className="grid items-start gap-2 py-4">
      <Link
        href="/dashboard"
        className={cn(
          "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
          pathname === "/dashboard" ? "bg-accent" : "transparent",
        )}
      >
        <BarChart3 className="mr-2 h-4 w-4" />
        <span>Dashboard</span>
      </Link>
      <Link
        href="/reservations"
        className={cn(
          "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
          pathname?.startsWith("/reservations") ? "bg-accent" : "transparent",
        )}
      >
        <CalendarDays className="mr-2 h-4 w-4" />
        <span>Reservas</span>
      </Link>
      <Link
        href="/english-classroom"
        className={cn(
          "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
          pathname?.startsWith("/english-classroom") ? "bg-accent" : "transparent",
        )}
      >
        <School className="mr-2 h-4 w-4" />
        <span>Aula de Inglés</span>
      </Link>
      <Link
        href="/reports"
        className={cn(
          "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
          pathname?.startsWith("/reports") ? "bg-accent" : "transparent",
        )}
      >
        <FileBarChart className="mr-2 h-4 w-4" />
        <span>Reportes</span>
      </Link>
      <Link
        href="/settings"
        className={cn(
          "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
          pathname?.startsWith("/settings") ? "bg-accent" : "transparent",
        )}
      >
        <Settings className="mr-2 h-4 w-4" />
        <span>Configuración</span>
      </Link>
    </nav>
  )
}
