import { NextResponse } from "next/server"
import { dbService } from "@/lib/server-db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const reservation = dbService.getReservationById(params.id)

    if (!reservation) {
      return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 })
    }

    return NextResponse.json(reservation)
  } catch (error) {
    console.error("Error al obtener reserva:", error)
    return NextResponse.json({ error: "Error al obtener reserva" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const updated = dbService.updateReservation(params.id, body)

    if (!updated) {
      return NextResponse.json({ error: "No se pudo actualizar la reserva" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error al actualizar reserva:", error)
    return NextResponse.json({ error: error.message || "Error al actualizar reserva" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    dbService.deleteReservation(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al eliminar reserva:", error)
    return NextResponse.json({ error: "Error al eliminar reserva" }, { status: 500 })
  }
}
