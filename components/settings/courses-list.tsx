"use client"

import { useState } from "react"
import { useSchedule } from "@/context/schedule-context"
import { useToast } from "@/components/ui/use-toast"
import type { Course } from "@/types/schema"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil, Trash } from "lucide-react"

interface CoursesListProps {
  courses: Course[]
  onEdit: (course: Course) => void
}

export function CoursesList({ courses, onEdit }: CoursesListProps) {
  const { deleteCourse } = useSchedule()
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null)

  const handleDelete = async () => {
    if (!courseToDelete) return

    setIsDeleting(true)
    try {
      await deleteCourse(courseToDelete.id)
      toast({
        title: "Curso eliminado",
        description: "El curso ha sido eliminado correctamente.",
      })
    } catch (error) {
      toast({
        title: "Error al eliminar",
        description: "No se pudo eliminar el curso. Verifique que no tenga reservas asociadas.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setCourseToDelete(null)
    }
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Color</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.id}>
                <TableCell>
                  <div className="w-6 h-6 rounded-full" style={{ backgroundColor: course.color }} />
                </TableCell>
                <TableCell>{course.name}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Abrir menú</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(course)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setCourseToDelete(course)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}

            {courses.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  No hay cursos disponibles
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!courseToDelete} onOpenChange={(open) => !open && setCourseToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el curso "{courseToDelete?.name}" y no se puede deshacer. Las reservas asociadas a
              este curso también podrían verse afectadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
