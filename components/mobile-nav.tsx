"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { BarChart3, CalendarDays, FileBarChart, Settings, School } from "lucide-react"

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <div className="px-7">
          <Link href="/" className="flex items-center">
            <span className="font-bold">Sistema de Agenda de Aula Funcional</span>
          </Link>
        </div>
        <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
          <div className="flex flex-col space-y-3">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                pathname === "/dashboard" ? "bg-accent" : "transparent",
              )}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/reservations"
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                pathname?.startsWith("/reservations") ? "bg-accent" : "transparent",
              )}
            >
              <CalendarDays className="mr-2 h-4 w-4" />
              <span>Reservas</span>
            </Link>
            <Link
              href="/english-classroom"
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                pathname?.startsWith("/english-classroom") ? "bg-accent" : "transparent",
              )}
            >
              <School className="mr-2 h-4 w-4" />
              <span>Aula de Inglés</span>
            </Link>
            <Link
              href="/reports"
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                pathname?.startsWith("/reports") ? "bg-accent" : "transparent",
              )}
            >
              <FileBarChart className="mr-2 h-4 w-4" />
              <span>Reportes</span>
            </Link>
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                pathname?.startsWith("/settings") ? "bg-accent" : "transparent",
              )}
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Configuración</span>
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
