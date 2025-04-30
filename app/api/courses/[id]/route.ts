import { NextResponse } from "next/server"
import { dbService } from "@/lib/server-db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params // Destructure params
    const course = await dbService.getCourseById(id) // Added await

    if (!course) {
      return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 })
    }

    return NextResponse.json(course)
  } catch (error) {
    console.error("Error al obtener curso:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al obtener curso" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params // Destructure params
    const body = await request.json()
    const updated = await dbService.updateCourse(id, body) // Added await

    if (!updated) {
      return NextResponse.json({ error: "No se pudo actualizar el curso" }, { status: 400 })
    }

    return NextResponse.json(updated) // Return updated course instead of message
  } catch (error) {
    console.error("Error al actualizar curso:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al actualizar curso" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params // Destructure params
    await dbService.deleteCourse(id) // Added await and simplified
    return NextResponse.json({ message: "Curso eliminado correctamente" })
  } catch (error) {
    console.error("Error al eliminar curso:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al eliminar curso" },
      { status: 500 }
    )
  }
}