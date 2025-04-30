import { NextResponse } from "next/server"
import { dbService } from "@/lib/server-db"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const { status } = await request.json()

    if (!status) {
      return NextResponse.json({ error: "Se requiere el estado" }, { status: 400 })
    }

    try {
      dbService.updateReservationStatus(id, status)
      return NextResponse.json({ message: "Estado de reserva actualizado correctamente" })
    } catch (error: any) {
      return NextResponse.json({ error: error.message || "Error al actualizar estado de reserva" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error al actualizar estado de reserva:", error)
    return NextResponse.json({ error: "Error al actualizar estado de reserva" }, { status: 500 })
  }
}
