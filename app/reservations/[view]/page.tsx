import { Suspense } from "react"
import type { Metadata } from "next"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ReservationsCalendarView } from "@/components/reservations/reservations-calendar-view"
import { ReservationsTableSkeleton } from "@/components/reservations/reservations-table-skeleton"
import { ReservationCreateButton } from "@/components/reservations/reservation-create-button"
import { ViewSelector } from "@/components/reservations/view-selector"

export const metadata: Metadata = {
  title: "Reservas | Sistema de Agenda de Aula Funcional",
  description: "Gestiona las reservas de aulas funcionales",
}

interface ReservationsViewPageProps {
  params: {
    view: string
  }
}

export default function ReservationsViewPage({ params }: ReservationsViewPageProps) {
  const view = params.view

  return (
    <DashboardShell>
      <DashboardHeader heading="Reservas" text="Gestiona las reservas de aulas funcionales.">
        <div className="flex items-center gap-2">
          <ViewSelector currentView={view} />
          <ReservationCreateButton />
        </div>
      </DashboardHeader>
      <Suspense fallback={<ReservationsTableSkeleton />}>
        <ReservationsCalendarView view={view} />
      </Suspense>
    </DashboardShell>
  )
}
