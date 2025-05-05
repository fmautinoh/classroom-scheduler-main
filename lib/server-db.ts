import Database from "better-sqlite3"
import path from "path"
import { generateId } from "@/lib/utils"
import type { Course, Teacher, Classroom, Reservation } from "@/types/schema"

// Inicializar la base de datos
const dbPath = path.resolve(process.cwd(), "classroom-scheduler.db")
let db: Database.Database

try {
  db = new Database(dbPath)
  initializeDatabase()
} catch (error) {
  console.error("Error al inicializar la base de datos:", error)
}

// Función para inicializar la base de datos
function initializeDatabase() {
  // Crear tablas si no existen
  db.exec(`
    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS teachers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS classrooms (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      capacity INTEGER NOT NULL,
      description TEXT,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reservations (
      id TEXT PRIMARY KEY,
      courseId TEXT NOT NULL,
      teacherId TEXT NOT NULL,
      classroomId TEXT NOT NULL,
      grade TEXT NOT NULL,
      section TEXT NOT NULL,
      startTime TEXT NOT NULL,
      endTime TEXT NOT NULL,
      topic TEXT NOT NULL,
      status TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (courseId) REFERENCES courses(id),
      FOREIGN KEY (teacherId) REFERENCES teachers(id),
      FOREIGN KEY (classroomId) REFERENCES classrooms(id)
    );
  `)
}

// Exportar la base de datos para su uso en las API routes
export { db }

// Funciones de utilidad para las API routes
export const dbService = {
  // Cursos
  getAllCourses: () => {
    return db.prepare("SELECT * FROM courses").all() as Course[]
  },

  getCourseById: (id: string) => {
    return db.prepare("SELECT * FROM courses WHERE id = ?").get(id) as Course | undefined
  },

  addCourse: (course: Omit<Course, "id">) => {
    const id = generateId()
    const createdAt = new Date().toISOString()

    db.prepare("INSERT INTO courses (id, name, color, createdAt) VALUES (?, ?, ?, ?)").run(
      id,
      course.name,
      course.color,
      createdAt,
    )

    return { id, ...course, createdAt }
  },

  updateCourse: (id: string, course: Partial<Course>) => {
    const updates = []
    const params = []

    if (course.name !== undefined) {
      updates.push("name = ?")
      params.push(course.name)
    }

    if (course.color !== undefined) {
      updates.push("color = ?")
      params.push(course.color)
    }

    if (updates.length === 0) return false

    params.push(id)

    db.prepare(`UPDATE courses SET ${updates.join(", ")} WHERE id = ?`).run(...params)
    return true
  },

  deleteCourse: (id: string) => {
    // Verificar si hay reservas asociadas
    const reservationsCount = db.prepare("SELECT COUNT(*) as count FROM reservations WHERE courseId = ?").get(id) as {
      count: number
    }

    if (reservationsCount.count > 0) {
      throw new Error("No se puede eliminar el curso porque tiene reservas asociadas")
    }

    db.prepare("DELETE FROM courses WHERE id = ?").run(id)
    return true
  },

  // Docentes
  getAllTeachers: () => {
    return db.prepare("SELECT * FROM teachers").all() as Teacher[]
  },

  getTeacherById: (id: string) => {
    return db.prepare("SELECT * FROM teachers WHERE id = ?").get(id) as Teacher | undefined
  },

  addTeacher: (teacher: Omit<Teacher, "id">) => {
    const id = generateId()
    const createdAt = new Date().toISOString()

    db.prepare("INSERT INTO teachers (id, name, email, createdAt) VALUES (?, ?, ?, ?)").run(
      id,
      teacher.name,
      teacher.email,
      createdAt,
    )

    return { id, ...teacher, createdAt }
  },

  updateTeacher: (id: string, teacher: Partial<Teacher>) => {
    const updates = []
    const params = []

    if (teacher.name !== undefined) {
      updates.push("name = ?")
      params.push(teacher.name)
    }

    if (teacher.email !== undefined) {
      updates.push("email = ?")
      params.push(teacher.email)
    }

    if (updates.length === 0) return false

    params.push(id)

    db.prepare(`UPDATE teachers SET ${updates.join(", ")} WHERE id = ?`).run(...params)
    return true
  },

  deleteTeacher: (id: string) => {
    // Verificar si hay reservas asociadas
    const reservationsCount = db.prepare("SELECT COUNT(*) as count FROM reservations WHERE teacherId = ?").get(id) as {
      count: number
    }

    if (reservationsCount.count > 0) {
      throw new Error("No se puede eliminar el docente porque tiene reservas asociadas")
    }

    db.prepare("DELETE FROM teachers WHERE id = ?").run(id)
    return true
  },

  // Aulas
  getAllClassrooms: () => {
    return db.prepare("SELECT * FROM classrooms").all() as Classroom[]
  },

  getClassroomById: (id: string) => {
    return db.prepare("SELECT * FROM classrooms WHERE id = ?").get(id) as Classroom | undefined
  },

  addClassroom: (classroom: Omit<Classroom, "id">) => {
    const id = generateId()
    const createdAt = new Date().toISOString()

    db.prepare("INSERT INTO classrooms (id, name, capacity, description, createdAt) VALUES (?, ?, ?, ?, ?)").run(
      id,
      classroom.name,
      classroom.capacity,
      classroom.description || null,
      createdAt,
    )

    return { id, ...classroom, createdAt }
  },

  updateClassroom: (id: string, classroom: Partial<Classroom>) => {
    const updates = []
    const params = []

    if (classroom.name !== undefined) {
      updates.push("name = ?")
      params.push(classroom.name)
    }

    if (classroom.capacity !== undefined) {
      updates.push("capacity = ?")
      params.push(classroom.capacity)
    }

    if (classroom.description !== undefined) {
      updates.push("description = ?")
      params.push(classroom.description)
    }

    if (updates.length === 0) return false

    params.push(id)

    db.prepare(`UPDATE classrooms SET ${updates.join(", ")} WHERE id = ?`).run(...params)
    return true
  },

  deleteClassroom: (id: string) => {
    // Verificar si hay reservas asociadas
    const reservationsCount = db
      .prepare("SELECT COUNT(*) as count FROM reservations WHERE classroomId = ?")
      .get(id) as { count: number }

    if (reservationsCount.count > 0) {
      throw new Error("No se puede eliminar el aula porque tiene reservas asociadas")
    }

    db.prepare("DELETE FROM classrooms WHERE id = ?").run(id)
    return true
  },

  // Reservas
  getAllReservations: () => {
    const reservations = db
      .prepare(`
      SELECT 
        r.*,
        c.name as courseName,
        c.color as courseColor,
        t.name as teacherName,
        cl.name as classroom
      FROM reservations r
      JOIN courses c ON r.courseId = c.id
      JOIN teachers t ON r.teacherId = t.id
      JOIN classrooms cl ON r.classroomId = cl.id
    `)
      .all() as Reservation[]

    return reservations
  },

  getReservationById: (id: string) => {
    return db
      .prepare(`
      SELECT 
        r.*,
        c.name as courseName,
        c.color as courseColor,
        t.name as teacherName,
        cl.name as classroom
      FROM reservations r
      JOIN courses c ON r.courseId = c.id
      JOIN teachers t ON r.teacherId = t.id
      JOIN classrooms cl ON r.classroomId = cl.id
      WHERE r.id = ?
    `)
      .get(id) as Reservation | undefined
  },

  // Mejorar el manejo de errores en la función addReservation
  addReservation: (
    reservation: Omit<Reservation, "id" | "courseName" | "courseColor" | "teacherName" | "classroom">,
  ) => {
    try {
      // Verificar que existan los registros relacionados antes de intentar crear la reserva
      const courseExists = db
        .prepare("SELECT COUNT(*) as count FROM courses WHERE id = ?")
        .get(reservation.courseId) as { count: number }
      if (courseExists.count === 0) {
        throw new Error("El curso seleccionado no existe en la base de datos")
      }

      const teacherExists = db
        .prepare("SELECT COUNT(*) as count FROM teachers WHERE id = ?")
        .get(reservation.teacherId) as { count: number }
      if (teacherExists.count === 0) {
        throw new Error("El docente seleccionado no existe en la base de datos")
      }

      const classroomExists = db
        .prepare("SELECT COUNT(*) as count FROM classrooms WHERE id = ?")
        .get(reservation.classroomId) as { count: number }
      if (classroomExists.count === 0) {
        throw new Error("El aula seleccionada no existe en la base de datos")
      }

      // Verificar si hay solapamiento de reservas
      const overlappingReservations = db
        .prepare(`
      SELECT COUNT(*) as count FROM reservations 
      WHERE classroomId = ? 
      AND (
        (startTime <= ? AND endTime > ?) OR
        (startTime < ? AND endTime >= ?) OR
        (startTime >= ? AND endTime <= ?)
      )
    `)
        .get(
          reservation.classroomId,
          reservation.startTime,
          reservation.startTime,
          reservation.endTime,
          reservation.endTime,
          reservation.startTime,
          reservation.endTime,
        ) as { count: number }

      if (overlappingReservations.count > 0) {
        throw new Error("Ya existe una reserva para esta aula en el horario seleccionado")
      }

      const id = generateId()
      const createdAt = new Date().toISOString()
      const status = reservation.status || "programado"

      db.prepare(`
      INSERT INTO reservations 
      (id, courseId, teacherId, classroomId, grade, section, startTime, endTime, topic, status, createdAt) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
        id,
        reservation.courseId,
        reservation.teacherId,
        reservation.classroomId,
        reservation.grade,
        reservation.section,
        reservation.startTime,
        reservation.endTime,
        reservation.topic,
        status,
        createdAt,
      )

      // Obtener la reserva completa con los datos relacionados
      return dbService.getReservationById(id) as Reservation
    } catch (error: any) {
      console.error("Error al crear reserva:", error)

      // Proporcionar un mensaje de error más descriptivo
      if (error.code === "SQLITE_CONSTRAINT_FOREIGNKEY") {
        throw new Error(
          "Error de relación: Uno o más elementos relacionados no existen en la base de datos. Por favor, actualice la página e intente nuevamente.",
        )
      }

      throw error
    }
  },

  updateReservation: (
    id: string,
    reservation: Partial<Omit<Reservation, "id" | "courseName" | "courseColor" | "teacherName" | "classroom">>,
  ) => {
    // Si hay cambios en fechas o aula, verificar solapamiento
    if (reservation.startTime || reservation.endTime || reservation.classroomId) {
      // Obtener la reserva actual
      const currentReservation = db.prepare("SELECT * FROM reservations WHERE id = ?").get(id) as any

      if (!currentReservation) {
        throw new Error("Reserva no encontrada")
      }

      const classroomId = reservation.classroomId || currentReservation.classroomId
      const startTime = reservation.startTime || currentReservation.startTime
      const endTime = reservation.endTime || currentReservation.endTime

      // Verificar solapamiento excluyendo esta reserva
      const overlappingReservations = db
        .prepare(`
        SELECT COUNT(*) as count FROM reservations 
        WHERE id != ? 
        AND classroomId = ? 
        AND (
          (startTime <= ? AND endTime > ?) OR
          (startTime < ? AND endTime >= ?) OR
          (startTime >= ? AND endTime <= ?)
        )
      `)
        .get(id, classroomId, startTime, startTime, endTime, endTime, startTime, endTime) as { count: number }

      if (overlappingReservations.count > 0) {
        throw new Error("Ya existe una reserva para esta aula en el horario seleccionado")
      }
    }

    const updates = []
    const params = []

    if (reservation.courseId !== undefined) {
      updates.push("courseId = ?")
      params.push(reservation.courseId)
    }

    if (reservation.teacherId !== undefined) {
      updates.push("teacherId = ?")
      params.push(reservation.teacherId)
    }

    if (reservation.classroomId !== undefined) {
      updates.push("classroomId = ?")
      params.push(reservation.classroomId)
    }

    if (reservation.grade !== undefined) {
      updates.push("grade = ?")
      params.push(reservation.grade)
    }

    if (reservation.section !== undefined) {
      updates.push("section = ?")
      params.push(reservation.section)
    }

    if (reservation.startTime !== undefined) {
      updates.push("startTime = ?")
      params.push(reservation.startTime)
    }

    if (reservation.endTime !== undefined) {
      updates.push("endTime = ?")
      params.push(reservation.endTime)
    }

    if (reservation.topic !== undefined) {
      updates.push("topic = ?")
      params.push(reservation.topic)
    }

    if (reservation.status !== undefined) {
      updates.push("status = ?")
      params.push(reservation.status)
    }

    if (updates.length === 0) return false

    params.push(id)

    db.prepare(`UPDATE reservations SET ${updates.join(", ")} WHERE id = ?`).run(...params)
    return true
  },

  updateReservationStatus: (id: string, status: string) => {
    db.prepare("UPDATE reservations SET status = ? WHERE id = ?").run(status, id)
    return true
  },

  deleteReservation: (id: string) => {
    try {
      // Verificar que la reserva existe antes de eliminarla
      const reservation = db.prepare("SELECT * FROM reservations WHERE id = ?").get(id)
      if (!reservation) {
        throw new Error("La reserva no existe")
      }

      // Eliminar la reserva
      db.prepare("DELETE FROM reservations WHERE id = ?").run(id)

      // Verificar que la reserva se eliminó correctamente
      const deletedReservation = db.prepare("SELECT * FROM reservations WHERE id = ?").get(id)
      if (deletedReservation) {
        throw new Error("Error al eliminar la reserva")
      }

      return true
    } catch (error) {
      console.error("Error al eliminar la reserva:", error)
      throw error
    }
  },
}
