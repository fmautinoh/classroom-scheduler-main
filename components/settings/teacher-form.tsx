"use client"

import { useState, useEffect } from "react"
import { useSchedule } from "@/context/schedule-context"
import { useToast } from "@/components/ui/use-toast"
import type { Teacher } from "@/types/schema"
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
// Importar el componente de alerta de validación
import { FormValidationAlert } from "@/components/ui/form-validation-alert"

interface TeacherFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  teacher: Teacher | null
}

const formSchema = z.object({
  name: z.string().min(1, { message: "El nombre es requerido" }),
  email: z.string().email({ message: "Correo electrónico inválido" }),
})

export function TeacherForm({ open, onOpenChange, teacher }: TeacherFormProps) {
  const { addTeacher, updateTeacher } = useSchedule()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Añadir estado para controlar la alerta de validación
  const [validationAlertOpen, setValidationAlertOpen] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  })

  useEffect(() => {
    if (teacher) {
      form.reset({
        name: teacher.name,
        email: teacher.email,
      })
    } else {
      form.reset({
        name: "",
        email: "",
      })
    }
  }, [teacher, form])

  // Modificar la función onSubmit para mostrar alertas de validación
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Verificar si hay errores de validación
    const formErrors = form.formState.errors
    if (Object.keys(formErrors).length > 0) {
      const errorMessages = Object.entries(formErrors).map(([field, error]) => {
        const fieldNames: Record<string, string> = {
          name: "Nombre completo",
          email: "Correo electrónico",
        }
        return `${fieldNames[field] || field}: ${error.message}`
      })
      setValidationErrors(errorMessages)
      setValidationAlertOpen(true)
      return
    }

    setIsSubmitting(true)

    try {
      if (teacher) {
        await updateTeacher(teacher.id, values)
        toast({
          title: "Docente actualizado",
          description: "El docente ha sido actualizado correctamente.",
        })
      } else {
        await addTeacher(values)
        toast({
          title: "Docente creado",
          description: "El docente ha sido creado correctamente.",
        })
      }

      onOpenChange(false)
    } catch (error: any) {
      setValidationErrors([error.message || "Ocurrió un error al procesar el docente. Intente nuevamente."])
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
            <DialogTitle>{teacher ? "Editar Docente" : "Nuevo Docente"}</DialogTitle>
            <DialogDescription>
              {teacher
                ? "Modifique los detalles del docente existente."
                : "Complete los detalles para crear un nuevo docente."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Juan Pérez" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo Electrónico</FormLabel>
                    <FormControl>
                      <Input placeholder="juan.perez@ejemplo.com" {...field} />
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
                  {teacher ? "Actualizar" : "Crear"}
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
