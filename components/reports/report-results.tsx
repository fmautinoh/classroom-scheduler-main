"use client"

import { useSchedule } from "@/context/schedule-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReportTable } from "@/components/reports/report-table"
import { ReportChart } from "@/components/reports/report-chart"

export function ReportResults() {
  const { reportData, reportFilters } = useSchedule()

  if (!reportData || reportData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resultados del Reporte</CardTitle>
          <CardDescription>Seleccione los filtros y genere un reporte para ver los resultados.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[400px] text-muted-foreground">
          No hay datos para mostrar. Genere un reporte primero.
        </CardContent>
      </Card>
    )
  }

  const title =
    reportFilters?.type === "teacher"
      ? `Reporte de Docente: ${reportData[0]?.teacherName || ""}`
      : `Reporte de Curso: ${reportData[0]?.courseName || ""}`

  const description = (() => {
    switch (reportFilters?.period) {
      case "week":
        return "Reporte semanal"
      case "month":
        return "Reporte mensual"
      case "year":
        return "Reporte anual"
      case "custom":
        return "Reporte personalizado"
      default:
        return "Reporte"
    }
  })()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="table">
          <TabsList className="mb-4">
            <TabsTrigger value="table">Tabla</TabsTrigger>
            <TabsTrigger value="chart">Gráfico</TabsTrigger>
          </TabsList>
          <TabsContent value="table">
            <ReportTable data={reportData} />
          </TabsContent>
          <TabsContent value="chart">
            <ReportChart data={reportData} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
