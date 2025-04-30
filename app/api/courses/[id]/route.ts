import { NextResponse } from "next/server"
import { dbService } from "@/lib/server-db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const course = dbService.getCourseById(params.id)

    if (!course) {
      return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 })
    }

    return NextResponse.json(course)
  } catch (error) {
    console.error("Error al obtener curso:", error)
    return NextResponse.json({ error: "Error al obtener curso" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const updated = dbService.updateCourse(params.id, body)

    if (!updated) {
      return NextResponse.json({ error: "No se pudo actualizar el curso" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al actualizar curso:", error)
    return NextResponse.json({ error: "Error al actualizar curso" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    dbService.deleteCourse(params.id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error al eliminar curso:", error)
    return NextResponse.json({ error: error.message || "Error al eliminar curso" }, { status: 500 })
  }
}
