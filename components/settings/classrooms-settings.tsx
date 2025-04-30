"use client"

import { useState } from "react"
import { useSchedule } from "@/context/schedule-context"
import type { Classroom } from "@/types/schema"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ClassroomForm } from "@/components/settings/classroom-form"
import { ClassroomsList } from "@/components/settings/classrooms-list"

export function ClassroomsSettings() {
  const { classrooms } = useSchedule()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(null)

  const handleEdit = (classroom: Classroom) => {
    setEditingClassroom(classroom)
    setIsFormOpen(true)
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingClassroom(null)
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle>Aulas</CardTitle>
            <CardDescription>Gestiona las aulas disponibles para las reservas.</CardDescription>
          </div>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Aula
          </Button>
        </CardHeader>
        <CardContent>
          <ClassroomsList classrooms={classrooms} onEdit={handleEdit} />
        </CardContent>
      </Card>

      <ClassroomForm open={isFormOpen} onOpenChange={handleFormClose} classroom={editingClassroom} />
    </>
  )
}
