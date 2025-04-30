import { NextResponse } from "next/server"
import { dbService } from "@/lib/server-db"

export async function GET() {
  try {
    const classrooms = dbService.getAllClassrooms()
    return NextResponse.json(classrooms)
  } catch (error) {
    console.error("Error al obtener aulas:", error)
    return NextResponse.json({ error: "Error al obtener aulas" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const classroom = dbService.addClassroom(body)
    return NextResponse.json(classroom, { status: 201 })
  } catch (error) {
    console.error("Error al crear aula:", error)
    return NextResponse.json({ error: "Error al crear aula" }, { status: 500 })
  }
}
