import type { Course, Teacher, Classroom, Reservation } from "@/types/schema"

// Operaciones CRUD para cursos
const coursesDB = {
  getAll: async (): Promise<Course[]> => {
    const response = await fetch("/api/courses", { cache: "no-store" })
    if (!response.ok) throw new Error("Error al obtener cursos")
    return response.json()
  },

  add: async (course: Omit<Course, "id">): Promise<void> => {
    const response = await fetch("/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(course),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Error al añadir curso")
    }
  },

  update: async (id: string, data: Partial<Course>): Promise<void> => {
    const response = await fetch(`/api/courses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Error al actualizar curso")
    }
  },

  remove: async (id: string): Promise<void> => {
    const response = await fetch(`/api/courses/${id}`, {
      method: "DELETE",
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Error al eliminar curso")
    }
  },
}

// Operaciones CRUD para docentes
const teachersDB = {
  getAll: async (): Promise<Teacher[]> => {
    const response = await fetch("/api/teachers", { cache: "no-store" })
    if (!response.ok) throw new Error("Error al obtener docentes")
    return response.json()
  },

  add: async (teacher: Omit<Teacher, "id">): Promise<void> => {
    const response = await fetch("/api/teachers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(teacher),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Error al añadir docente")
    }
  },

  update: async (id: string, data: Partial<Teacher>): Promise<void> => {
    const response = await fetch(`/api/teachers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Error al actualizar docente")
    }
  },

  remove: async (id: string): Promise<void> => {
    const response = await fetch(`/api/teachers/${id}`, {
      method: "DELETE",
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Error al eliminar docente")
    }
  },
}

// Operaciones CRUD para aulas
const classroomsDB = {
  getAll: async (): Promise<Classroom[]> => {
    const response = await fetch("/api/classrooms", { cache: "no-store" })
    if (!response.ok) throw new Error("Error al obtener aulas")
    return response.json()
  },

  add: async (classroom: Omit<Classroom, "id">): Promise<void> => {
    const response = await fetch("/api/classrooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(classroom),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Error al añadir aula")
    }
  },

  update: async (id: string, data: Partial<Classroom>): Promise<void> => {
    const response = await fetch(`/api/classrooms/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Error al actualizar aula")
    }
  },

  remove: async (id: string): Promise<void> => {
    const response = await fetch(`/api/classrooms/${id}`, {
      method: "DELETE",
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Error al eliminar aula")
    }
  },
}

// Operaciones CRUD para reservas
const reservationsDB = {
  getAll: async (): Promise<Reservation[]> => {
    const response = await fetch("/api/reservations", { cache: "no-store" })
    if (!response.ok) throw new Error("Error al obtener reservas")
    return response.json()
  },

  add: async (
    reservation: Omit<Reservation, "id" | "courseName" | "courseColor" | "teacherName" | "classroom">,
  ): Promise<void> => {
    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reservation),
      })

      if (!response.ok) {
        const error = await response.json()
        const errorMessage = error.error || "Error al añadir reserva"

        // Proporcionar un mensaje más descriptivo para el error de clave foránea
        if (errorMessage.includes("FOREIGN KEY constraint failed") || errorMessage.includes("Error de relación")) {
          throw new Error(
            "Error de relación: Uno o más elementos relacionados no existen en la base de datos. Por favor, actualice la página e intente nuevamente.",
          )
        }

        throw new Error(errorMessage)
      }
    } catch (error: any) {
      console.error("Error en la solicitud de reserva:", error)
      throw error
    }
  },

  update: async (
    id: string,
    data: Partial<Omit<Reservation, "id" | "courseName" | "courseColor" | "teacherName" | "classroom">>,
  ): Promise<void> => {
    const response = await fetch(`/api/reservations/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Error al actualizar reserva")
    }
  },

  updateStatus: async (id: string, status: string): Promise<void> => {
    const response = await fetch(`/api/reservations/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Error al actualizar estado de reserva")
    }
  },

  remove: async (id: string): Promise<void> => {
    const response = await fetch(`/api/reservations/${id}`, {
      method: "DELETE",
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Error al eliminar reserva")
    }
  },
}

// Exportar la "base de datos"
export const db = {
  courses: coursesDB,
  teachers: teachersDB,
  classrooms: classroomsDB,
  reservations: reservationsDB,
}
