import { NextResponse } from "next/server"
import { dbService } from "@/lib/server-db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const classroom = dbService.getClassroomById(params.id)

    if (!classroom) {
      return NextResponse.json({ error: "Aula no encontrada" }, { status: 404 })
    }

    return NextResponse.json(classroom)
  } catch (error) {
    console.error("Error al obtener aula:", error)
    return NextResponse.json({ error: "Error al obtener aula" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const updated = dbService.updateClassroom(params.id, body)

    if (!updated) {
      return NextResponse.json({ error: "No se pudo actualizar el aula" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al actualizar aula:", error)
    return NextResponse.json({ error: "Error al actualizar aula" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    dbService.deleteClassroom(params.id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error al eliminar aula:", error)
    return NextResponse.json({ error: error.message || "Error al eliminar aula" }, { status: 500 })
  }
}
