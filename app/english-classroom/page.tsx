import { Suspense } from "react"
import type { Metadata } from "next"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { EnglishClassroomScheduler } from "@/components/english-classroom/english-classroom-scheduler"
import { ReservationsTableSkeleton } from "@/components/reservations/reservations-table-skeleton"

export const metadata: Metadata = {
  title: "Aula de Inglés | Sistema de Agenda de Aula Funcional",
  description: "Programación anual o semanal para el aula funcional de inglés",
}

export default function EnglishClassroomPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Aula Funcional de Inglés"
        text="Programa reservas anuales o semanales para el aula de inglés."
      />
      <Suspense fallback={<ReservationsTableSkeleton />}>
        <EnglishClassroomScheduler />
      </Suspense>
    </DashboardShell>
  )
}
