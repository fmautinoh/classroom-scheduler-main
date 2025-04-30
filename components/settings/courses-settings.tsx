"use client"

import { useState } from "react"
import { useSchedule } from "@/context/schedule-context"
import { useToast } from "@/components/ui/use-toast"
import type { Course } from "@/types/schema"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { CourseForm } from "@/components/settings/course-form"
import { CoursesList } from "@/components/settings/courses-list"

export function CoursesSettings() {
  const { courses } = useSchedule()
  const { toast } = useToast()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)

  const handleEdit = (course: Course) => {
    setEditingCourse(course)
    setIsFormOpen(true)
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingCourse(null)
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle>Cursos</CardTitle>
            <CardDescription>Gestiona los cursos disponibles para las reservas.</CardDescription>
          </div>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Curso
          </Button>
        </CardHeader>
        <CardContent>
          <CoursesList courses={courses} onEdit={handleEdit} />
        </CardContent>
      </Card>

      <CourseForm open={isFormOpen} onOpenChange={handleFormClose} course={editingCourse} />
    </>
  )
}
