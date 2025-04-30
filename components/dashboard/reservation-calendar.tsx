"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useSchedule } from "@/context/schedule-context"
import { getStatusColor } from "@/lib/colors"
import { Skeleton } from "@/components/ui/skeleton"
import dynamic from "next/dynamic"

// Importar FullCalendar y plugins de manera dinámica
const FullCalendarComponent = dynamic(
  () =>
    import("@fullcalendar/react").then((mod) => {
      return import("@fullcalendar/daygrid").then((daygridMod) => {
        return import("@fullcalendar/timegrid").then((timegridMod) => {
          return import("@fullcalendar/interaction").then((interactionMod) => {
            // Importar locale
            import("@fullcalendar/core/locales/es")

            // Configurar el componente con todos los plugins cargados
            const { default: FullCalendar } = mod
            const dayGridPlugin = daygridMod.default
            const timeGridPlugin = timegridMod.default
            const interactionPlugin = interactionMod.default

            // Devolver un componente que renderiza FullCalendar con los plugins
            return (props: any) => (
              <FullCalendar plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]} {...props} />
            )
          })
        })
      })
    }),
  { ssr: false },
)

// Importar locale sin dynamic import (es solo datos)
import esLocale from "@fullcalendar/core/locales/es"

export function ReservationCalendar() {
  const { reservations } = useSchedule()
  const [calendarEvents, setCalendarEvents] = useState<any[]>([])
  const [isClient, setIsClient] = useState(false)
  const [isCalendarLoaded, setIsCalendarLoaded] = useState(false)
  const calendarRef = useRef<any>(null)
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
          classroom: reservation.classroom,
          grade: reservation.grade,
          section: reservation.section,
          status: reservation.status,
          topic: reservation.topic,
        },
      }
    })

    setCalendarEvents(events)
  }, [reservations, isClient])

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
          <p><strong>Curso:</strong> ${info.event.title}</p>
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
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Calendario de Reservas</CardTitle>
        <CardDescription>Vista general de las reservas programadas.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          {!isClient ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <div className="h-full w-full">
              {isClient && (
                <FullCalendarComponent
                  ref={calendarRef}
                  initialView="dayGridMonth"
                  headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,timeGridWeek,timeGridDay",
                  }}
                  events={calendarEvents}
                  height="100%"
                  locale={esLocale}
                  eventTimeFormat={{
                    hour: "2-digit",
                    minute: "2-digit",
                    meridiem: false,
                    hour12: false,
                  }}
                  slotMinTime="07:00:00"
                  slotMaxTime="17:00:00"
                  eventDidMount={handleEventDidMount}
                  datesSet={handleCalendarDidMount}
                />
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
