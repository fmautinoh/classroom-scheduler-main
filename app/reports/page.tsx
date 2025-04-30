import { Suspense } from "react"
import type { Metadata } from "next"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ReportFilters } from "@/components/reports/report-filters"
import { ReportResults } from "@/components/reports/report-results"
import { ReportsSkeleton } from "@/components/reports/reports-skeleton"

export const metadata: Metadata = {
  title: "Reportes | Sistema de Agenda de Aula Funcional",
  description: "Genera reportes de uso por docente y curso",
}

export default function ReportsPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Reportes" text="Genera reportes de uso por docente y curso." />
      <ReportFilters />
      <Suspense fallback={<ReportsSkeleton />}>
        <ReportResults />
      </Suspense>
    </DashboardShell>
  )
}
