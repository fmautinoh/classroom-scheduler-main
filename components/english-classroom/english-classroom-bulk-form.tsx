"use client"

import { useState } from "react"
import { useSchedule } from "@/context/schedule-context"
import { useToast } from "@/components/ui/use-toast"
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
import { Checkbox } from "@/components/ui/checkbox"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { FormValidationAlert } from "@/components/ui/form-validation-alert"

interface EnglishClassroomBulkFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  classroomId: string
}

const weekdays = [
  { id: "0", label: "Domingo" },
  { id: "1", label: "Lunes" },
  { id: "2", label: "Martes" },
  { id: "3", label: "Miércoles" },
  { id: "4", label: "Jueves" },
  { id: "5", label: "Viernes" },
  { id: "6", label: "Sábado" },
]

const formSchema = z.object({
  courseId: z.string().min(1, { message: "Seleccione un curso" }),
  teacherId: z.string().min(1, { message: "Seleccione un docente" }),
  grade: z.string().min(1, { message: "Seleccione un grado" }),
  section: z.string().min(1, { message: "Seleccione una sección" }),
  startDate: z.date({ required_error: "Seleccione una fecha de inicio" }),
  endDate: z.date({ required_error: "Seleccione una fecha de fin" }),
  startTime: z.string().min(1, { message: "Seleccione hora de inicio" }),
  endTime: z.string().min(1, { message: "Seleccione hora de fin" }),
  topic: z.string().min(1, { message: "Ingrese el tema a desarrollar" }),
  weekdays: z.array(z.string()).min(1, { message: "Seleccione al menos un día de la semana" }),
})

export function EnglishClassroomBulkForm({ open, onOpenChange, classroomId }: EnglishClassroomBulkFormProps) {
  const { courses, teachers, addReservation } = useSchedule()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationAlertOpen, setValidationAlertOpen] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      courseId: "",
      teacherId: "",
      grade: "",
      section: "",
      startTime: "08:00",
      endTime: "09:00",
      topic: "",
      weekdays: [],
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const formErrors = form.formState.errors
    if (Object.keys(formErrors).length > 0) {
      const errorMessages = Object.entries(formErrors).map(([field, error]) => {
        const fieldNames: Record<string, string> = {
          courseId: "Curso",
          teacherId: "Docente",
          grade: "Grado",
          section: "Sección",
          startDate: "Fecha de inicio",
          endDate: "Fecha de fin",
          startTime: "Hora de inicio",
          endTime: "Hora de fin",
          topic: "Tema a desarrollar",
          weekdays: "Días de la semana",
        }
        return `${fieldNames[field] || field}: ${error.message}`
      })
      setValidationErrors(errorMessages)
      setValidationAlertOpen(true)
      return
    }

    setIsSubmitting(true)

    try {
      const { startDate, endDate, weekdays, ...rest } = values

      // Validar que la fecha de fin sea posterior a la de inicio
      if (endDate < startDate) {
        setValidationErrors(["La fecha de fin debe ser posterior a la fecha de inicio."])
        setValidationAlertOpen(true)
        setIsSubmitting(false)
        return
      }

      // Validar que la hora de fin sea posterior a la de inicio
      const [startHour, startMinute] = values.startTime.split(":").map(Number)
      const [endHour, endMinute] = values.endTime.split(":").map(Number)

      if (endHour < startHour || (endHour === startHour && endMinute <= startMinute)) {
        setValidationErrors(["La hora de fin debe ser posterior a la hora de inicio."])
        setValidationAlertOpen(true)
        setIsSubmitting(false)
        return
      }

      // Generar todas las fechas entre startDate y endDate que coincidan con los días de la semana seleccionados
      const reservationDates: Date[] = []
      const currentDate = new Date(startDate)

      while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay().toString()

        if (weekdays.includes(dayOfWeek)) {
          reservationDates.push(new Date(currentDate))
        }

        // Avanzar al siguiente día
        currentDate.setDate(currentDate.getDate() + 1)
      }

      // Verificar que haya al menos una fecha para crear reservas
      if (reservationDates.length === 0) {
        setValidationErrors(["No hay fechas disponibles para crear reservas con los criterios seleccionados."])
        setValidationAlertOpen(true)
        setIsSubmitting(false)
        return
      }

      // Crear reservas para cada fecha
      const createdCount = await Promise.all(
        reservationDates.map(async (date) => {
          try {
            // Crear fechas de inicio y fin para esta reserva
            const reservationStartDate = new Date(date)
            reservationStartDate.setHours(startHour, startMinute, 0)

            const reservationEndDate = new Date(date)
            reservationEndDate.setHours(endHour, endMinute, 0)

            await addReservation({
              ...rest,
              classroomId,
              startTime: reservationStartDate.toISOString(),
              endTime: reservationEndDate.toISOString(),
              status: "programado",
            })

            return true
          } catch (error) {
            console.error("Error creating reservation:", error)
            return false
          }
        }),
      )

      const successCount = createdCount.filter(Boolean).length

      toast({
        title: "Reservas creadas",
        description: `Se han creado ${successCount} de ${reservationDates.length} reservas correctamente.`,
      })

      onOpenChange(false)
    } catch (error: any) {
      setValidationErrors([error.message || "Ocurrió un error al procesar las reservas. Intente nuevamente."])
      setValidationAlertOpen(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Programación Masiva</DialogTitle>
            <DialogDescription>
              Cree múltiples reservas para el aula de inglés seleccionando un rango de fechas y días de la semana.
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

                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Fecha Inicio</FormLabel>
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

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Fecha Fin</FormLabel>
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
                            disabled={(date) => {
                              const startDate = form.getValues("startDate")
                              return date < new Date() || (startDate && date < startDate)
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="weekdays"
                  render={() => (
                    <FormItem className="col-span-2">
                      <div className="mb-2">
                        <FormLabel>Días de la semana</FormLabel>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {weekdays.map((day) => (
                          <FormField
                            key={day.id}
                            control={form.control}
                            name="weekdays"
                            render={({ field }) => {
                              return (
                                <FormItem key={day.id} className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(day.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, day.id])
                                          : field.onChange(field.value?.filter((value) => value !== day.id))
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">{day.label}</FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                  Crear Reservas
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
