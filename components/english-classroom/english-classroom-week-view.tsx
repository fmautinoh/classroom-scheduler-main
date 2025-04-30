"use client"

import { useState, useEffect, useRef } from "react"
import { useSchedule } from "@/context/schedule-context"
import { getStatusColor } from "@/lib/colors"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ReservationDialog } from "@/components/reservations/reservation-dialog"
import { ReservationFormDialog } from "@/components/reservations/reservation-form-dialog"
import type { Reservation } from "@/types/schema"
import dynamic from "next/dynamic"

// Importar FullCalendar y plugins de manera dinámica
const FullCalendarComponent = dynamic(
  () =>
    import("@fullcalendar/react").then((mod) => {
      return import("@fullcalendar/timegrid").then((timegridMod) => {
        return import("@fullcalendar/interaction").then((interactionMod) => {
          // Importar locale
          import("@fullcalendar/core/locales/es")

          // Configurar el componente con todos los plugins cargados
          const { default: FullCalendar } = mod
          const timeGridPlugin = timegridMod.default
          const interactionPlugin = interactionMod.default

          // Devolver un componente que renderiza FullCalendar con los plugins
          return (props: any) => <FullCalendar plugins={[timeGridPlugin, interactionPlugin]} {...props} />
        })
      })
    }),
  { ssr: false },
)

// Importar locale sin dynamic import (es solo datos)
import esLocale from "@fullcalendar/core/locales/es"

interface EnglishClassroomWeekViewProps {
  classroomId: string
}

export function EnglishClassroomWeekView({ classroomId }: EnglishClassroomWeekViewProps) {
  const { reservations } = useSchedule()
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([])
  const [calendarEvents, setCalendarEvents] = useState<any[]>([])
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const calendarRef = useRef<any>(null)
  const [isClient, setIsClient] = useState(false)
  const [isCalendarLoaded, setIsCalendarLoaded] = useState(false)
  const tooltipRef = useRef<HTMLDivElement | null>(null)

  // Set isClient to true when component mounts (client-side only)
  useEffect(() => {
    setIsClient(true)
    return () => {
      // Clean up any tooltips when component unmounts
      if (tooltipRef.current && document.body.contains(tooltipRef.current)) {
        document.body.removeChild(tooltipRef.current)
      }
    }
  }, [])

  // Filtrar reservas por aula
  useEffect(() => {
    if (!classroomId) return

    const filtered = reservations.filter((reservation) => reservation.classroomId === classroomId)

    setFilteredReservations(filtered)
  }, [reservations, classroomId])

  // Convertir reservas a eventos del calendario
  useEffect(() => {
    if (!isClient) return

    const events = filteredReservations.map((reservation) => {
      const statusColor = getStatusColor(reservation.status, reservation.courseColor)

      return {
        id: reservation.id,
        title: `${reservation.courseName} - ${reservation.grade}${reservation.section}`,
        start: reservation.startTime,
        end: reservation.endTime,
        backgroundColor: statusColor,
        borderColor: statusColor,
        extendedProps: {
          ...reservation,
        },
      }
    })

    setCalendarEvents(events)
  }, [filteredReservations, isClient])

  const handleEventClick = (info: any) => {
    try {
      const reservation = filteredReservations.find((r) => r.id === info.event.id)
      if (reservation) {
        setSelectedReservation(reservation)
        setIsDialogOpen(true)
      }
    } catch (error) {
      console.error("Error in event click handler:", error)
    }
  }

  const handleDateClick = (info: any) => {
    try {
      setSelectedDate(info.date)
      setIsFormOpen(true)
    } catch (error) {
      console.error("Error in date click handler:", error)
    }
  }

  // Handle calendar loading state
  const handleCalendarDidMount = () => {
    setIsCalendarLoaded(true)
  }

  // Safe event mounting with error handling
  const handleEventDidMount = (info: any) => {
    try {
      const tooltip = document.createElement("div")
      tooltip.className = "calendar-tooltip"
      tooltip.innerHTML = `
        <div class="p-2 bg-background border rounded shadow-lg text-xs">
          <p><strong>Curso:</strong> ${info.event.extendedProps.courseName}</p>
          <p><strong>Docente:</strong> ${info.event.extendedProps.teacherName}</p>
          <p><strong>Grado:</strong> ${info.event.extendedProps.grade} ${info.event.extendedProps.section}</p>
          <p><strong>Estado:</strong> ${info.event.extendedProps.status}</p>
          <p><strong>Tema:</strong> ${info.event.extendedProps.topic}</p>
        </div>
      `

      const mouseEnter = () => {
        try {
          document.body.appendChild(tooltip)
          tooltipRef.current = tooltip
          const rect = info.el.getBoundingClientRect()
          tooltip.style.position = "absolute"
          tooltip.style.zIndex = "1000"
          tooltip.style.top = `${rect.bottom + window.scrollY}px`
          tooltip.style.left = `${rect.left + window.scrollX}px`
        } catch (error) {
          console.error("Error in mouseEnter:", error)
        }
      }

      const mouseLeave = () => {
        try {
          if (document.body.contains(tooltip)) {
            document.body.removeChild(tooltip)
            tooltipRef.current = null
          }
        } catch (error) {
          console.error("Error in mouseLeave:", error)
        }
      }

      info.el.addEventListener("mouseenter", mouseEnter)
      info.el.addEventListener("mouseleave", mouseLeave)

      return () => {
        try {
          info.el.removeEventListener("mouseenter", mouseEnter)
          info.el.removeEventListener("mouseleave", mouseLeave)
          if (document.body.contains(tooltip)) {
            document.body.removeChild(tooltip)
          }
        } catch (error) {
          console.error("Error in cleanup:", error)
        }
      }
    } catch (error) {
      console.error("Error in eventDidMount:", error)
      return () => {}
    }
  }

  return (
    <>
      <Card>
        <CardContent className="p-4">
          <div className="h-[700px]">
            {!isClient ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <div className="h-full w-full">
                {isClient && (
                  <FullCalendarComponent
                    ref={calendarRef}
                    initialView="timeGridWeek"
                    headerToolbar={{
                      left: "prev,next today",
                      center: "title",
                      right: "",
                    }}
                    events={calendarEvents}
                    height="100%"
                    locale={esLocale}
                    nowIndicator={true}
                    slotMinTime="07:00:00"
                    slotMaxTime="17:00:00"
                    allDaySlot={false}
                    weekends={true}
                    slotDuration="00:30:00"
                    eventTimeFormat={{
                      hour: "2-digit",
                      minute: "2-digit",
                      meridiem: false,
                      hour12: false,
                    }}
                    eventClick={handleEventClick}
                    dateClick={handleDateClick}
                    eventDidMount={handleEventDidMount}
                    datesSet={handleCalendarDidMount}
                  />
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedReservation && (
        <ReservationDialog reservation={selectedReservation} open={isDialogOpen} onOpenChange={setIsDialogOpen} />
      )}

      {selectedDate && (
        <ReservationFormDialog
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          initialDate={selectedDate}
          initialClassroomId={classroomId}
        />
      )}
    </>
  )
}
