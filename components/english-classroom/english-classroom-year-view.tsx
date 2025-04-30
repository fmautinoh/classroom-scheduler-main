"use client"

import { useState, useEffect } from "react"
import { useSchedule } from "@/context/schedule-context"
import { getStatusColor } from "@/lib/colors"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { ReservationDialog } from "@/components/reservations/reservation-dialog"
import type { Reservation } from "@/types/schema"

interface EnglishClassroomYearViewProps {
  classroomId: string
}

export function EnglishClassroomYearView({ classroomId }: EnglishClassroomYearViewProps) {
  const { reservations } = useSchedule()
  const [year, setYear] = useState(new Date().getFullYear())
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([])
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Filtrar reservas por aula y año
  useEffect(() => {
    if (!classroomId) return

    const filtered = reservations.filter((reservation) => {
      const reservationDate = new Date(reservation.startTime)
      return reservation.classroomId === classroomId && reservationDate.getFullYear() === year
    })

    setFilteredReservations(filtered)
  }, [reservations, classroomId, year])

  // Generar calendario anual
  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]

  const handlePrevYear = () => setYear(year - 1)
  const handleNextYear = () => setYear(year + 1)

  const handleReservationClick = (reservation: Reservation) => {
    setSelectedReservation(reservation)
    setIsDialogOpen(true)
  }

  // Obtener el número de días en un mes
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  // Obtener el día de la semana del primer día del mes (0 = Domingo, 1 = Lunes, etc.)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <Button variant="outline" size="icon" onClick={handlePrevYear}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-bold">{year}</h2>
        <Button variant="outline" size="icon" onClick={handleNextYear}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {months.map((month, monthIndex) => (
          <Card key={month} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-muted p-2 font-medium text-center border-b">{month}</div>
              <div className="grid grid-cols-7 text-center text-xs">
                <div className="p-1 border-r border-b">D</div>
                <div className="p-1 border-r border-b">L</div>
                <div className="p-1 border-r border-b">M</div>
                <div className="p-1 border-r border-b">X</div>
                <div className="p-1 border-r border-b">J</div>
                <div className="p-1 border-r border-b">V</div>
                <div className="p-1 border-b">S</div>
              </div>
              <div className="grid grid-cols-7 text-center text-xs">
                {Array.from({ length: getFirstDayOfMonth(year, monthIndex) }).map((_, i) => (
                  <div key={`empty-start-${i}`} className="p-1 h-8 border-r border-b"></div>
                ))}

                {Array.from({ length: getDaysInMonth(year, monthIndex) }).map((_, i) => {
                  const day = i + 1
                  const currentDate = new Date(year, monthIndex, day)

                  // Filtrar reservas para este día
                  const dayReservations = filteredReservations.filter((reservation) => {
                    const reservationDate = new Date(reservation.startTime)
                    return (
                      reservationDate.getFullYear() === year &&
                      reservationDate.getMonth() === monthIndex &&
                      reservationDate.getDate() === day
                    )
                  })

                  const hasReservations = dayReservations.length > 0
                  const isToday = new Date().toDateString() === currentDate.toDateString()

                  return (
                    <div
                      key={`day-${day}`}
                      className={`p-1 h-8 border-r border-b relative ${isToday ? "bg-muted/50" : ""} ${
                        (i + getFirstDayOfMonth(year, monthIndex) + 1) % 7 === 0 ? "border-r-0" : ""
                      }`}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">{day}</div>

                      {hasReservations && (
                        <div
                          className="absolute bottom-0 left-0 right-0 h-1 cursor-pointer"
                          style={{
                            backgroundColor: getStatusColor(dayReservations[0].status, dayReservations[0].courseColor),
                          }}
                          onClick={() => handleReservationClick(dayReservations[0])}
                          title={`${dayReservations.length} reserva(s)`}
                        />
                      )}
                    </div>
                  )
                })}

                {Array.from({
                  length: 7 - ((getDaysInMonth(year, monthIndex) + getFirstDayOfMonth(year, monthIndex)) % 7 || 7),
                }).map((_, i) => (
                  <div key={`empty-end-${i}`} className="p-1 h-8 border-r border-b"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedReservation && (
        <ReservationDialog reservation={selectedReservation} open={isDialogOpen} onOpenChange={setIsDialogOpen} />
      )}
    </>
  )
}
