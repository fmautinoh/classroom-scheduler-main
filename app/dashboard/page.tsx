import { Suspense } from "react"
import type { Metadata } from "next"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { RecentReservations } from "@/components/dashboard/recent-reservations"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { ReservationCalendar } from "@/components/dashboard/reservation-calendar"

export const metadata: Metadata = {
  title: "Dashboard | Sistema de Agenda de Aula Funcional",
  description: "Dashboard del sistema de agenda de aulas funcionales",
}

export default function DashboardPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Dashboard" text="Visualiza las estadísticas y reservas recientes." />
      <Suspense fallback={<DashboardSkeleton />}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <DashboardStats />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
          <div className="col-span-1 md:col-span-1 lg:col-span-3">
            <RecentReservations />
          </div>
          <div className="col-span-1 md:col-span-1 lg:col-span-4">
            <ReservationCalendar />
          </div>
        </div>
      </Suspense>
    </DashboardShell>
  )
}
