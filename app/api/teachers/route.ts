import { NextResponse } from "next/server"
import { dbService } from "@/lib/server-db"

export async function GET() {
  try {
    const teachers = dbService.getAllTeachers()
    return NextResponse.json(teachers)
  } catch (error) {
    console.error("Error al obtener docentes:", error)
    return NextResponse.json({ error: "Error al obtener docentes" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const teacher = dbService.addTeacher(body)
    return NextResponse.json(teacher, { status: 201 })
  } catch (error) {
    console.error("Error al crear docente:", error)
    return NextResponse.json({ error: "Error al crear docente" }, { status: 500 })
  }
}
