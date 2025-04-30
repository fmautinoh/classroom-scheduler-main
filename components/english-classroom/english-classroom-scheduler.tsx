"use client"

import { useState, useEffect } from "react"
import { useSchedule } from "@/context/schedule-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { EnglishClassroomYearView } from "@/components/english-classroom/english-classroom-year-view"
import { EnglishClassroomWeekView } from "@/components/english-classroom/english-classroom-week-view"
import { EnglishClassroomBulkForm } from "@/components/english-classroom/english-classroom-bulk-form"
import { CalendarDays, Calendar } from "lucide-react"

export function EnglishClassroomScheduler() {
  const { classrooms } = useSchedule()
  const [selectedView, setSelectedView] = useState<"year" | "week">("year")
  const [englishClassroomId, setEnglishClassroomId] = useState<string>("")
  const [isFormOpen, setIsFormOpen] = useState(false)

  // Buscar el aula de inglés automáticamente
  useEffect(() => {
    const englishRoom = classrooms.find(
      (room) => room.name.toLowerCase().includes("inglés") || room.name.toLowerCase().includes("ingles"),
    )

    if (englishRoom) {
      setEnglishClassroomId(englishRoom.id)
    } else if (classrooms.length > 0) {
      setEnglishClassroomId(classrooms[0].id)
    }
  }, [classrooms])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Programación del Aula de Inglés</CardTitle>
              <CardDescription>Visualiza y programa reservas anuales o semanales</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="w-full sm:w-[200px]">
                <Label htmlFor="classroom-select">Aula</Label>
                <Select value={englishClassroomId} onValueChange={setEnglishClassroomId}>
                  <SelectTrigger id="classroom-select">
                    <SelectValue placeholder="Seleccionar aula" />
                  </SelectTrigger>
                  <SelectContent>
                    {classrooms.map((classroom) => (
                      <SelectItem key={classroom.id} value={classroom.id}>
                        {classroom.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={() => setIsFormOpen(true)}>Programación Masiva</Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedView} onValueChange={(value) => setSelectedView(value as "year" | "week")}>
            <TabsList className="mb-4">
              <TabsTrigger value="year">
                <Calendar className="h-4 w-4 mr-2" />
                Vista Anual
              </TabsTrigger>
              <TabsTrigger value="week">
                <CalendarDays className="h-4 w-4 mr-2" />
                Vista Semanal
              </TabsTrigger>
            </TabsList>
            <TabsContent value="year">
              {englishClassroomId && <EnglishClassroomYearView classroomId={englishClassroomId} />}
            </TabsContent>
            <TabsContent value="week">
              {englishClassroomId && <EnglishClassroomWeekView classroomId={englishClassroomId} />}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <EnglishClassroomBulkForm open={isFormOpen} onOpenChange={setIsFormOpen} classroomId={englishClassroomId} />
    </div>
  )
}
