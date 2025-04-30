import { Suspense } from "react"
import type { Metadata } from "next"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { SettingsTabs } from "@/components/settings/settings-tabs"
import { SettingsSkeleton } from "@/components/settings/settings-skeleton"

export const metadata: Metadata = {
  title: "Configuración | Sistema de Agenda de Aula Funcional",
  description: "Configura cursos, docentes, aulas y más",
}

export default function SettingsPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Configuración" text="Gestiona cursos, docentes, aulas y más." />
      <Suspense fallback={<SettingsSkeleton />}>
        <SettingsTabs />
      </Suspense>
    </DashboardShell>
  )
}
