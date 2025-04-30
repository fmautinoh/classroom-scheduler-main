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
    // Añadir un pequeño retraso para asegurar que las operaciones previas se hayan completado
    await new Promise((resolve) => setTimeout(resolve, 500))

    const body = await request.json()

    // Verificar explícitamente que los registros relacionados existan
    const courseExists = dbService.getCourseById(body.courseId)
    if (!courseExists) {
      return NextResponse.json({ error: "El curso seleccionado no existe en la base de datos" }, { status: 400 })
    }

    const teacherExists = dbService.getTeacherById(body.teacherId)
    if (!teacherExists) {
      return NextResponse.json({ error: "El docente seleccionado no existe en la base de datos" }, { status: 400 })
    }

    const classroomExists = dbService.getClassroomById(body.classroomId)
    if (!classroomExists) {
      return NextResponse.json({ error: "El aula seleccionada no existe en la base de datos" }, { status: 400 })
    }

    const reservation = dbService.addReservation(body)
    return NextResponse.json(reservation, { status: 201 })
  } catch (error: any) {
    console.error("Error al crear reserva:", error)

    // Proporcionar un mensaje de error más descriptivo
    const errorMessage = error.message || "Error al crear reserva"
    let statusCode = 500

    if (
      error.code === "SQLITE_CONSTRAINT_FOREIGNKEY" ||
      errorMessage.includes("Error de relación") ||
      errorMessage.includes("no existe")
    ) {
      statusCode = 400
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}
