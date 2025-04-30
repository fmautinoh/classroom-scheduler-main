"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { useSchedule } from "@/context/schedule-context"
import { getStatusColor } from "@/lib/colors"
import { Skeleton } from "@/components/ui/skeleton"
import { ReservationDialog } from "@/components/reservations/reservation-dialog"
import type { Reservation } from "@/types/schema"
import dynamic from "next/dynamic"

// Importar FullCalendar y plugins de manera dinámica
const FullCalendarComponent = dynamic(
  () =>
    import("@fullcalendar/react").then((mod) => {
      return import("@fullcalendar/daygrid").then((daygridMod) => {
        return import("@fullcalendar/timegrid").then((timegridMod) => {
          return import("@fullcalendar/list").then((listMod) => {
            return import("@fullcalendar/interaction").then((interactionMod) => {
              // Importar locale
              import("@fullcalendar/core/locales/es")

              // Configurar el componente con todos los plugins cargados
              const { default: FullCalendar } = mod
              const dayGridPlugin = daygridMod.default
              const timeGridPlugin = timegridMod.default
              const listPlugin = listMod.default
              const interactionPlugin = interactionMod.default

              // Devolver un componente que renderiza FullCalendar con los plugins
              return (props: any) => (
                <FullCalendar plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]} {...props} />
              )
            })
          })
        })
      })
    }),
  { ssr: false },
)

// Importar locale sin dynamic import (es solo datos)
import esLocale from "@fullcalendar/core/locales/es"

interface ReservationsCalendarViewProps {
  view?: string
}

export function ReservationsCalendarView({ view = "month" }: ReservationsCalendarViewProps) {
  const { reservations } = useSchedule()
  const [calendarEvents, setCalendarEvents] = useState<any[]>([])
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
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

  useEffect(() => {
    if (!isClient) return

    const events = reservations.map((reservation) => {
      const statusColor = getStatusColor(reservation.status, reservation.courseColor)

      return {
        id: reservation.id,
        title: `${reservation.courseName} - ${reservation.teacherName}`,
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
  }, [reservations, isClient])

  useEffect(() => {
    if (!isClient || !isCalendarLoaded || !calendarRef.current) return

    try {
      const calendarApi = calendarRef.current.getApi()
      if (!calendarApi) return

      switch (view) {
        case "day":
          calendarApi.changeView("timeGridDay")
          break
        case "week":
          calendarApi.changeView("timeGridWeek")
          break
        case "list":
          calendarApi.changeView("listMonth")
          break
        default:
          calendarApi.changeView("dayGridMonth")
      }
    } catch (error) {
      console.error("Error changing calendar view:", error)
    }
  }, [view, calendarRef, isClient, isCalendarLoaded])

  const handleEventClick = (info: any) => {
    try {
      const reservation = reservations.find((r) => r.id === info.event.id)
      if (reservation) {
        setSelectedReservation(reservation)
        setIsDialogOpen(true)
      }
    } catch (error) {
      console.error("Error in event click handler:", error)
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
          <p><strong>Aula:</strong> ${info.event.extendedProps.classroom}</p>
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
                    initialView={
                      view === "day"
                        ? "timeGridDay"
                        : view === "week"
                          ? "timeGridWeek"
                          : view === "list"
                            ? "listMonth"
                            : "dayGridMonth"
                    }
                    headerToolbar={{
                      left: "prev,next today",
                      center: "title",
                      right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth",
                    }}
                    events={calendarEvents}
                    height="100%"
                    locale={esLocale}
                    nowIndicator={true}
                    slotMinTime="07:00:00"
                    slotMaxTime="17:00:00"
                    allDaySlot={false}
                    eventTimeFormat={{
                      hour: "2-digit",
                      minute: "2-digit",
                      meridiem: false,
                      hour12: false,
                    }}
                    eventClick={handleEventClick}
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
    </>
  )
}
