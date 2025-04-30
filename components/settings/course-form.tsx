"use client"

import { useState, useEffect } from "react"
import { useSchedule } from "@/context/schedule-context"
import { useToast } from "@/components/ui/use-toast"
import type { Course } from "@/types/schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { COURSE_COLORS } from "@/lib/colors"
// Importar el componente de alerta de validación
import { FormValidationAlert } from "@/components/ui/form-validation-alert"

interface CourseFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  course: Course | null
}

const formSchema = z.object({
  name: z.string().min(1, { message: "El nombre es requerido" }),
  color: z.string().min(1, { message: "El color es requerido" }),
})

export function CourseForm({ open, onOpenChange, course }: CourseFormProps) {
  const { addCourse, updateCourse, courses } = useSchedule()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [availableColors, setAvailableColors] = useState<string[]>([])
  // Añadir estado para controlar la alerta de validación
  const [validationAlertOpen, setValidationAlertOpen] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      color: "",
    },
  })

  useEffect(() => {
    if (course) {
      form.reset({
        name: course.name,
        color: course.color,
      })
    } else {
      form.reset({
        name: "",
        color: "",
      })
    }
  }, [course, form])

  useEffect(() => {
    // Filter out colors that are already in use by other courses
    const usedColors = courses.filter((c) => !course || c.id !== course.id).map((c) => c.color)

    const available = COURSE_COLORS.filter((color) => !usedColors.includes(color))
    setAvailableColors(available)

    // If editing and the current color is not in available colors, add it
    if (course && !available.includes(course.color)) {
      setAvailableColors((prev) => [...prev, course.color])
    }

    // Set default color if none selected
    if (!form.getValues().color && available.length > 0) {
      form.setValue("color", available[0])
    }
  }, [courses, course, form])

  // Modificar la función onSubmit para mostrar alertas de validación
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Verificar si hay errores de validación
    const formErrors = form.formState.errors
    if (Object.keys(formErrors).length > 0) {
      const errorMessages = Object.entries(formErrors).map(([field, error]) => {
        const fieldNames: Record<string, string> = {
          name: "Nombre del curso",
          color: "Color",
        }
        return `${fieldNames[field] || field}: ${error.message}`
      })
      setValidationErrors(errorMessages)
      setValidationAlertOpen(true)
      return
    }

    // Verificar si hay colores disponibles
    if (availableColors.length === 0) {
      setValidationErrors(["No hay colores disponibles. Edite o elimine otros cursos para liberar colores."])
      setValidationAlertOpen(true)
      return
    }

    setIsSubmitting(true)

    try {
      if (course) {
        await updateCourse(course.id, values)
        toast({
          title: "Curso actualizado",
          description: "El curso ha sido actualizado correctamente.",
        })
      } else {
        await addCourse(values)
        // Esperar un momento para asegurar que la base de datos procese la operación
        await new Promise((resolve) => setTimeout(resolve, 500))
        toast({
          title: "Curso creado",
          description: "El curso ha sido creado correctamente.",
        })
      }

      onOpenChange(false)
    } catch (error: any) {
      setValidationErrors([error.message || "Ocurrió un error al procesar el curso. Intente nuevamente."])
      setValidationAlertOpen(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Añadir el componente de alerta de validación al final del componente, justo antes del return final
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{course ? "Editar Curso" : "Nuevo Curso"}</DialogTitle>
            <DialogDescription>
              {course
                ? "Modifique los detalles del curso existente."
                : "Complete los detalles para crear un nuevo curso."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Curso</FormLabel>
                    <FormControl>
                      <Input placeholder="Matemáticas" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <div className="grid grid-cols-6 gap-2">
                      {availableColors.map((color) => (
                        <div
                          key={color}
                          className={`h-10 rounded-md cursor-pointer border-2 ${
                            field.value === color ? "border-primary" : "border-transparent"
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => form.setValue("color", color)}
                        />
                      ))}

                      {availableColors.length === 0 && (
                        <div className="col-span-6 text-sm text-muted-foreground">
                          No hay colores disponibles. Edite o elimine otros cursos para liberar colores.
                        </div>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting || availableColors.length === 0}>
                  {course ? "Actualizar" : "Crear"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <FormValidationAlert open={validationAlertOpen} onOpenChange={setValidationAlertOpen} errors={validationErrors} />
    </>
  )
}
