import { NextResponse } from "next/server"
import { dbService } from "@/lib/server-db"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { status } = await request.json()

    if (!status) {
      return NextResponse.json({ error: "Se requiere el estado" }, { status: 400 })
    }

    dbService.updateReservationStatus(params.id, status)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al actualizar estado de reserva:", error)
    return NextResponse.json({ error: "Error al actualizar estado de reserva" }, { status: 500 })
  }
}
