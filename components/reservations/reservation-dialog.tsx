"use client"

import { useState } from "react"
import { useSchedule } from "@/context/schedule-context"
import { useToast } from "@/components/ui/use-toast"
import type { Reservation } from "@/types/schema"
import { getStatusColor } from "@/lib/colors"
import { formatDate } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ReservationFormDialog } from "@/components/reservations/reservation-form-dialog"

interface ReservationDialogProps {
  reservation: Reservation
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReservationDialog({ reservation, open, onOpenChange }: ReservationDialogProps) {
  const { deleteReservation, updateReservationStatus } = useSchedule()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  const statusColor = getStatusColor(reservation.status, reservation.courseColor)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteReservation(reservation.id)
      toast({
        title: "Reserva eliminada",
        description: "La reserva ha sido eliminada correctamente.",
      })
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error al eliminar",
        description: "No se pudo eliminar la reserva. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdatingStatus(true)
    try {
      await updateReservationStatus(reservation.id, newStatus)
      toast({
        title: "Estado actualizado",
        description: `La reserva ahora está ${newStatus}.`,
      })
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error al actualizar",
        description: "No se pudo actualizar el estado. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  return (
    <>
      <Dialog open={open && !isEditing} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: statusColor }} />
              {reservation.courseName}
            </DialogTitle>
            <DialogDescription>Detalles de la reserva</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium mb-1">Docente</p>
                <p className="text-sm">{reservation.teacherName}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Aula</p>
                <p className="text-sm">{reservation.classroom}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Grado y Sección</p>
                <p className="text-sm">
                  {reservation.grade} {reservation.section}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Estado</p>
                <Badge
                  variant="outline"
                  className="capitalize"
                  style={{
                    backgroundColor: `${statusColor}20`,
                    color: statusColor,
                    borderColor: statusColor,
                  }}
                >
                  {reservation.status}
                </Badge>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium mb-1">Fecha y Hora</p>
                <p className="text-sm">
                  {formatDate(reservation.startTime)} - {formatDate(reservation.endTime, true)}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium mb-1">Tema a desarrollar</p>
                <p className="text-sm">{reservation.topic}</p>
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 flex gap-2">
              {reservation.status === "programado" && (
                <Button variant="outline" onClick={() => handleStatusChange("en curso")} disabled={isUpdatingStatus}>
                  Iniciar
                </Button>
              )}
              {reservation.status === "en curso" && (
                <Button variant="outline" onClick={() => handleStatusChange("finalizado")} disabled={isUpdatingStatus}>
                  Finalizar
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  onOpenChange(false)
                  setIsEditing(true)
                }}
              >
                Editar
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                Eliminar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isEditing && (
        <ReservationFormDialog
          open={isEditing}
          onOpenChange={(open) => {
            setIsEditing(open)
            if (!open) {
              onOpenChange(true)
            }
          }}
          reservation={reservation}
        />
      )}
    </>
  )
}
