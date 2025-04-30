import { NextResponse } from "next/server"
import { dbService } from "@/lib/server-db"

export async function GET() {
  try {
    const courses = dbService.getAllCourses()
    return NextResponse.json(courses)
  } catch (error) {
    console.error("Error al obtener cursos:", error)
    return NextResponse.json({ error: "Error al obtener cursos" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const course = dbService.addCourse(body)
    return NextResponse.json(course, { status: 201 })
  } catch (error) {
    console.error("Error al crear curso:", error)
    return NextResponse.json({ error: "Error al crear curso" }, { status: 500 })
  }
}
