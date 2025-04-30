"use client"

import { useState, useEffect } from "react"
import { useSchedule } from "@/context/schedule-context"
import { useToast } from "@/components/ui/use-toast"
import type { Classroom } from "@/types/schema"
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
import { Textarea } from "@/components/ui/textarea"
// Importar el componente de alerta de validación
import { FormValidationAlert } from "@/components/ui/form-validation-alert"

interface ClassroomFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  classroom: Classroom | null
}

const formSchema = z.object({
  name: z.string().min(1, { message: "El nombre es requerido" }),
  capacity: z.string().transform((val) => Number.parseInt(val, 10)),
  description: z.string().optional(),
})

export function ClassroomForm({ open, onOpenChange, classroom }: ClassroomFormProps) {
  const { addClassroom, updateClassroom } = useSchedule()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Añadir estado para controlar la alerta de validación
  const [validationAlertOpen, setValidationAlertOpen] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      capacity: "30",
      description: "",
    },
  })

  useEffect(() => {
    if (classroom) {
      form.reset({
        name: classroom.name,
        capacity: classroom.capacity.toString(),
        description: classroom.description || "",
      })
    } else {
      form.reset({
        name: "",
        capacity: "30",
        description: "",
      })
    }
  }, [classroom, form])

  // Modificar la función onSubmit para mostrar alertas de validación
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Verificar si hay errores de validación
    const formErrors = form.formState.errors
    if (Object.keys(formErrors).length > 0) {
      const errorMessages = Object.entries(formErrors).map(([field, error]) => {
        const fieldNames: Record<string, string> = {
          name: "Nombre del aula",
          capacity: "Capacidad",
          description: "Descripción",
        }
        return `${fieldNames[field] || field}: ${error.message}`
      })
      setValidationErrors(errorMessages)
      setValidationAlertOpen(true)
      return
    }

    setIsSubmitting(true)

    try {
      if (classroom) {
        await updateClassroom(classroom.id, values)
        toast({
          title: "Aula actualizada",
          description: "El aula ha sido actualizada correctamente.",
        })
      } else {
        await addClassroom(values)
        // Esperar un momento para asegurar que la base de datos procese la operación
        await new Promise((resolve) => setTimeout(resolve, 500))
        toast({
          title: "Aula creada",
          description: "El aula ha sido creada correctamente.",
        })
      }

      onOpenChange(false)
    } catch (error: any) {
      setValidationErrors([error.message || "Ocurrió un error al procesar el aula. Intente nuevamente."])
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
            <DialogTitle>{classroom ? "Editar Aula" : "Nueva Aula"}</DialogTitle>
            <DialogDescription>
              {classroom
                ? "Modifique los detalles del aula existente."
                : "Complete los detalles para crear una nueva aula."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Aula</FormLabel>
                    <FormControl>
                      <Input placeholder="Aula Funcional de Inglés" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacidad</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Descripción opcional del aula" className="resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {classroom ? "Actualizar" : "Crear"}
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
