"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function MainNav() {
  const pathname = usePathname()

  return (
    <div className="mr-4 hidden md:flex">
      <Link href="/" className="mr-6 flex items-center space-x-2">
        <span className="hidden font-bold sm:inline-block">Sistema de Agenda de Aula Funcional</span>
      </Link>
      <nav className="flex items-center space-x-6 text-sm font-medium">
        <Link
          href="/dashboard"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname === "/dashboard" ? "text-foreground" : "text-foreground/60",
          )}
        >
          Dashboard
        </Link>
        <Link
          href="/reservations"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/reservations") ? "text-foreground" : "text-foreground/60",
          )}
        >
          Reservas
        </Link>
        <Link
          href="/english-classroom"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/english-classroom") ? "text-foreground" : "text-foreground/60",
          )}
        >
          Aula de Inglés
        </Link>
        <Link
          href="/reports"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/reports") ? "text-foreground" : "text-foreground/60",
          )}
        >
          Reportes
        </Link>
        <Link
          href="/settings"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/settings") ? "text-foreground" : "text-foreground/60",
          )}
        >
          Configuración
        </Link>
      </nav>
    </div>
  )
}
