"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ReservationFormDialog } from "@/components/reservations/reservation-form-dialog"

export function ReservationCreateButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Nueva Reserva
      </Button>
      <ReservationFormDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
