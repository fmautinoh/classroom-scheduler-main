"use client"

import { useState } from "react"
import { useSchedule } from "@/context/schedule-context"
import type { Teacher } from "@/types/schema"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { TeacherForm } from "@/components/settings/teacher-form"
import { TeachersList } from "@/components/settings/teachers-list"

export function TeachersSettings() {
  const { teachers } = useSchedule()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null)

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher)
    setIsFormOpen(true)
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingTeacher(null)
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle>Docentes</CardTitle>
            <CardDescription>Gestiona los docentes disponibles para las reservas.</CardDescription>
          </div>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Docente
          </Button>
        </CardHeader>
        <CardContent>
          <TeachersList teachers={teachers} onEdit={handleEdit} />
        </CardContent>
      </Card>

      <TeacherForm open={isFormOpen} onOpenChange={handleFormClose} teacher={editingTeacher} />
    </>
  )
}
