"use client"

import { useState, useEffect } from "react"
import { useSchedule } from "@/context/schedule-context"
import { useToast } from "@/components/ui/use-toast"
import type { Reservation } from "@/types/schema"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Clock } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
// Importar el componente de alerta de validación
import { FormValidationAlert } from "@/components/ui/form-validation-alert"

interface ReservationFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reservation?: Reservation
  initialDate?: Date
  initialClassroomId?: string
}

const formSchema = z.object({
  courseId: z.string().min(1, { message: "Seleccione un curso" }),
  teacherId: z.string().min(1, { message: "Seleccione un docente" }),
  classroomId: z.string().min(1, { message: "Seleccione un aula" }),
  grade: z.string().min(1, { message: "Seleccione un grado" }),
  section: z.string().min(1, { message: "Seleccione una sección" }),
  date: z.date({ required_error: "Seleccione una fecha" }),
  startTime: z.string().min(1, { message: "Seleccione hora de inicio" }),
  endTime: z.string().min(1, { message: "Seleccione hora de fin" }),
  topic: z.string().min(1, { message: "Ingrese el tema a desarrollar" }),
  status: z.string().default("programado"),
})

export function ReservationFormDialog({
  open,
  onOpenChange,
  reservation,
  initialDate,
  initialClassroomId,
}: ReservationFormDialogProps) {
  const { courses, teachers, classrooms, addReservation, updateReservation } = useSchedule()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Añadir estado para controlar la alerta de validación
  const [validationAlertOpen, setValidationAlertOpen] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      courseId: "",
      teacherId: "",
      classroomId: "",
      grade: "",
      section: "",
      startTime: "08:00",
      endTime: "09:00",
      topic: "",
      status: "programado",
    },
  })

  useEffect(() => {
    if (reservation) {
      const startDate = new Date(reservation.startTime)
      const startHour = startDate.getHours().toString().padStart(2, "0")
      const startMinute = startDate.getMinutes().toString().padStart(2, "0")

      const endDate = new Date(reservation.endTime)
      const endHour = endDate.getHours().toString().padStart(2, "0")
      const endMinute = endDate.getMinutes().toString().padStart(2, "0")

      form.reset({
        courseId: reservation.courseId,
        teacherId: reservation.teacherId,
        classroomId: reservation.classroomId,
        grade: reservation.grade,
        section: reservation.section,
        date: startDate,
        startTime: `${startHour}:${startMinute}`,
        endTime: `${endHour}:${endMinute}`,
        topic: reservation.topic,
        status: reservation.status,
      })
    } else {
      form.reset({
        courseId: "",
        teacherId: "",
        classroomId: initialClassroomId || "",
        grade: "",
        section: "",
        date: initialDate || new Date(),
        startTime: "08:00",
        endTime: "09:00",
        topic: "",
        status: "programado",
      })
    }
  }, [reservation, form, initialDate, initialClassroomId])

  // Modificar la función onSubmit para mostrar alertas de validación
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Verificar si hay errores de validación
    const formErrors = form.formState.errors
    if (Object.keys(formErrors).length > 0) {
      const errorMessages = Object.entries(formErrors).map(([field, error]) => {
        const fieldNames: Record<string, string> = {
          courseId: "Curso",
          teacherId: "Docente",
          classroomId: "Aula",
          grade: "Grado",
          section: "Sección",
          date: "Fecha",
          startTime: "Hora de inicio",
          endTime: "Hora de fin",
          topic: "Tema a desarrollar",
        }
        return `${fieldNames[field] || field}: ${error.message}`
      })
      setValidationErrors(errorMessages)
      setValidationAlertOpen(true)
      return
    }

    setIsSubmitting(true)

    try {
      const { date, startTime, endTime, ...rest } = values

      // Create Date objects for start and end times
      const [startHour, startMinute] = startTime.split(":").map(Number)
      const [endHour, endMinute] = endTime.split(":").map(Number)

      const startDate = new Date(date)
      startDate.setHours(startHour, startMinute, 0)

      const endDate = new Date(date)
      endDate.setHours(endHour, endMinute, 0)

      // Validate that end time is after start time
      if (endDate <= startDate) {
        setValidationErrors(["La hora de fin debe ser posterior a la hora de inicio."])
        setValidationAlertOpen(true)
        setIsSubmitting(false)
        return
      }

      const reservationData = {
        ...rest,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
      }

      if (reservation) {
        await updateReservation(reservation.id, reservationData)
        toast({
          title: "Reserva actualizada",
          description: "La reserva ha sido actualizada correctamente.",
        })
      } else {
        await addReservation(reservationData)
        toast({
          title: "Reserva creada",
          description: "La reserva ha sido creada correctamente.",
        })
      }

      onOpenChange(false)
    } catch (error: any) {
      setValidationErrors([error.message || "Ocurrió un error al procesar la reserva. Intente nuevamente."])
      setValidationAlertOpen(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Añadir el componente de alerta de validación al final del componente, justo antes del return final
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{reservation ? "Editar Reserva" : "Nueva Reserva"}</DialogTitle>
            <DialogDescription>
              {reservation
                ? "Modifique los detalles de la reserva existente."
                : "Complete los detalles para crear una nueva reserva."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="courseId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Curso</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar curso" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {courses.map((course) => (
                            <SelectItem key={course.id} value={course.id}>
                              {course.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="teacherId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Docente</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar docente" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {teachers.map((teacher) => (
                            <SelectItem key={teacher.id} value={teacher.id}>
                              {teacher.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="classroomId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Aula</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar aula" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {classrooms.map((classroom) => (
                            <SelectItem key={classroom.id} value={classroom.id}>
                              {classroom.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <FormField
                    control={form.control}
                    name="grade"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Grado</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Grado" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1°">1°</SelectItem>
                            <SelectItem value="2°">2°</SelectItem>
                            <SelectItem value="3°">3°</SelectItem>
                            <SelectItem value="4°">4°</SelectItem>
                            <SelectItem value="5°">5°</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="section"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Sección</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sección" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="A">A</SelectItem>
                            <SelectItem value="B">B</SelectItem>
                            <SelectItem value="C">C</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Fecha</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: es })
                              ) : (
                                <span>Seleccionar fecha</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Hora Inicio</FormLabel>
                        <div className="flex items-center">
                          <FormControl>
                            <Input type="time" {...field} min="07:00" max="17:00" />
                          </FormControl>
                          <Clock className="ml-2 h-4 w-4 text-muted-foreground" />
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Hora Fin</FormLabel>
                        <div className="flex items-center">
                          <FormControl>
                            <Input type="time" {...field} min="07:00" max="17:00" />
                          </FormControl>
                          <Clock className="ml-2 h-4 w-4 text-muted-foreground" />
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {reservation && (
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar estado" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="programado">Programado</SelectItem>
                            <SelectItem value="en curso">En Curso</SelectItem>
                            <SelectItem value="finalizado">Finalizado</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="topic"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Tema a desarrollar</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ingrese el tema a desarrollar en la clase"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {reservation ? "Actualizar" : "Crear"}
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
