import { NextResponse } from "next/server"
import { dbService } from "@/lib/server-db"

export async function GET() {
  try {
    const reservations = dbService.getAllReservations()
    return NextResponse.json(reservations)
  } catch (error) {
    console.error("Error al obtener reservas:", error)
    return NextResponse.json({ error: "Error al obtener reservas" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const reservation = dbService.addReservation(body)
    return NextResponse.json(reservation, { status: 201 })
  } catch (error: any) {
    console.error("Error al crear reserva:", error)
    return NextResponse.json({ error: error.message || "Error al crear reserva" }, { status: 500 })
  }
}
