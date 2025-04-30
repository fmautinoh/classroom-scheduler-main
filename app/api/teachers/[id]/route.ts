import { NextResponse } from "next/server"
import { dbService } from "@/lib/server-db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params
    const teacher = await dbService.getTeacherById(id) // Added await

    if (!teacher) {
      return NextResponse.json({ error: "Docente no encontrado" }, { status: 404 })
    }

    return NextResponse.json(teacher)
  } catch (error) {
    console.error("Error al obtener docente:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al obtener docente" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params
    const body = await request.json()
    const updated = await dbService.updateTeacher(id, body) // Added await

    if (!updated) {
      return NextResponse.json({ error: "No se pudo actualizar el docente" }, { status: 400 })
    }

    return NextResponse.json(updated) // Return updated document instead of message
  } catch (error) {
    console.error("Error al actualizar docente:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al actualizar docente" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params
    await dbService.deleteTeacher(id) // Added await
    return NextResponse.json({ message: "Docente eliminado correctamente" })
  } catch (error) {
    console.error("Error al eliminar docente:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al eliminar docente" },
      { status: error instanceof Error ? 400 : 500 }
    )
  }
}