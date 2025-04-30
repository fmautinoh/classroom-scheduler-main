import { NextResponse } from "next/server"
import { dbService } from "@/lib/server-db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const teacher = dbService.getTeacherById(params.id)

    if (!teacher) {
      return NextResponse.json({ error: "Docente no encontrado" }, { status: 404 })
    }

    return NextResponse.json(teacher)
  } catch (error) {
    console.error("Error al obtener docente:", error)
    return NextResponse.json({ error: "Error al obtener docente" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const updated = dbService.updateTeacher(params.id, body)

    if (!updated) {
      return NextResponse.json({ error: "No se pudo actualizar el docente" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al actualizar docente:", error)
    return NextResponse.json({ error: "Error al actualizar docente" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    dbService.deleteTeacher(params.id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error al eliminar docente:", error)
    return NextResponse.json({ error: error.message || "Error al eliminar docente" }, { status: 500 })
  }
}
