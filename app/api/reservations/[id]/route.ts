import { NextResponse } from "next/server"
import { dbService } from "@/lib/server-db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params // Destructure directly

    const reservation = await dbService.getReservationById(id) // Ensure async/await

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
    const { id } = await params // Destructure directly
    const body = await request.json()

    const updated = await dbService.updateReservation(id, body) // Ensure async/await

    if (!updated) {
      return NextResponse.json({ error: "No se pudo actualizar la reserva" }, { status: 400 })
    }

    return NextResponse.json({ message: "Reserva actualizada correctamente" })
  } catch (error: any) {
    console.error("Error al actualizar reserva:", error)
    return NextResponse.json({ error: error.message || "Error al actualizar reserva" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params // Destructure directly
    console.log("ID de la reserva a eliminar:", id) // Log the ID for debugging
    try {
      await dbService.deleteReservation(id) // Ensure async/await
      return NextResponse.json({ message: "Reserva eliminada correctamente" })
    } catch (error: any) {
      return NextResponse.json({ error: error.message || "Error al eliminar reserva" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error al eliminar reserva:", error)
    return NextResponse.json({ error: "Error al eliminar reserva" }, { status: 500 })
  }
}