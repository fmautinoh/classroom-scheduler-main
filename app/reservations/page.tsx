import { Suspense } from "react"
import type { Metadata } from "next"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ReservationsCalendarView } from "@/components/reservations/reservations-calendar-view"
import { ReservationsTableSkeleton } from "@/components/reservations/reservations-table-skeleton"
import { ReservationCreateButton } from "@/components/reservations/reservation-create-button"

export const metadata: Metadata = {
  title: "Reservas | Sistema de Agenda de Aula Funcional",
  description: "Gestiona las reservas de aulas funcionales",
}

export default function ReservationsPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Reservas" text="Gestiona las reservas de aulas funcionales.">
        <ReservationCreateButton />
      </DashboardHeader>
      <Suspense fallback={<ReservationsTableSkeleton />}>
        <ReservationsCalendarView />
      </Suspense>
    </DashboardShell>
  )
}
