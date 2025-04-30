"use client"

import { useState } from "react"
import { useSchedule } from "@/context/schedule-context"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, FileDown } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"

export function ReportFilters() {
  const { courses, teachers, generateReport } = useSchedule()
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)

  const [filters, setFilters] = useState({
    type: "teacher",
    teacherId: "",
    courseId: "",
    period: "week",
    startDate: new Date(),
    endDate: new Date(),
  })

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleGenerateReport = async () => {
    setIsGenerating(true)
    try {
      // Validate filters
      if (filters.type === "teacher" && !filters.teacherId) {
        toast({
          title: "Error de validación",
          description: "Seleccione un docente para generar el reporte.",
          variant: "destructive",
        })
        return
      }

      if (filters.type === "course" && !filters.courseId) {
        toast({
          title: "Error de validación",
          description: "Seleccione un curso para generar el reporte.",
          variant: "destructive",
        })
        return
      }

      await generateReport(filters)
      toast({
        title: "Reporte generado",
        description: "El reporte ha sido generado correctamente.",
      })
    } catch (error) {
      toast({
        title: "Error al generar",
        description: "No se pudo generar el reporte. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
          <div>
            <Label htmlFor="report-type">Tipo de Reporte</Label>
            <Select value={filters.type} onValueChange={(value) => handleFilterChange("type", value)}>
              <SelectTrigger id="report-type">
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="teacher">Por Docente</SelectItem>
                <SelectItem value="course">Por Curso</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filters.type === "teacher" ? (
            <div>
              <Label htmlFor="teacher">Docente</Label>
              <Select value={filters.teacherId} onValueChange={(value) => handleFilterChange("teacherId", value)}>
                <SelectTrigger id="teacher">
                  <SelectValue placeholder="Seleccionar docente" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div>
              <Label htmlFor="course">Curso</Label>
              <Select value={filters.courseId} onValueChange={(value) => handleFilterChange("courseId", value)}>
                <SelectTrigger id="course">
                  <SelectValue placeholder="Seleccionar curso" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="period">Período</Label>
            <Select value={filters.period} onValueChange={(value) => handleFilterChange("period", value)}>
              <SelectTrigger id="period">
                <SelectValue placeholder="Seleccionar período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Semana</SelectItem>
                <SelectItem value="month">Mes</SelectItem>
                <SelectItem value="year">Año</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filters.period === "custom" && (
            <>
              <div>
                <Label>Fecha Inicio</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn("w-full pl-3 text-left font-normal", !filters.startDate && "text-muted-foreground")}
                    >
                      {filters.startDate ? (
                        format(filters.startDate, "PPP", { locale: es })
                      ) : (
                        <span>Seleccionar fecha</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.startDate}
                      onSelect={(date) => handleFilterChange("startDate", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>Fecha Fin</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn("w-full pl-3 text-left font-normal", !filters.endDate && "text-muted-foreground")}
                    >
                      {filters.endDate ? (
                        format(filters.endDate, "PPP", { locale: es })
                      ) : (
                        <span>Seleccionar fecha</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.endDate}
                      onSelect={(date) => handleFilterChange("endDate", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </>
          )}

          <div>
            <Button onClick={handleGenerateReport} disabled={isGenerating} className="w-full">
              <FileDown className="mr-2 h-4 w-4" />
              Generar Reporte
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
