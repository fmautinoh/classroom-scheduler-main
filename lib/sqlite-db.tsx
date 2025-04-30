import initSqlJs, { type Database } from "sql.js"
import type { Course, Teacher, Classroom, Reservation } from "@/types/schema"
import { generateId } from "@/lib/utils"

// URL del archivo wasm de SQL.js
const SQL_WASM_URL = "https://sql.js.org/dist/sql-wasm.wasm"

// Clase para manejar la base de datos SQLite
export class SQLiteDB {
  private static instance: SQLiteDB
  private db: Database | null = null
  private initialized = false
  private initializationPromise: Promise<void> | null = null

  private constructor() {
    // Constructor privado para singleton
  }

  public static getInstance(): SQLiteDB {
    if (!SQLiteDB.instance) {
      SQLiteDB.instance = new SQLiteDB()
    }
    return SQLiteDB.instance
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return

    if (this.initializationPromise) {
      return this.initializationPromise
    }

    this.initializationPromise = new Promise<void>(async (resolve, reject) => {
      try {
        // Inicializar SQL.js
        const SQL = await initSqlJs({
          locateFile: () => SQL_WASM_URL,
        })

        // Crear una nueva base de datos
        this.db = new SQL.Database()

        // Crear tablas
        this.createTables()

        // Cargar datos iniciales si es necesario
        await this.loadInitialData()

        this.initialized = true
        resolve()
      } catch (error) {
        console.error("Error initializing SQLite database:", error)
        reject(error)
      }
    })

    return this.initializationPromise
  }

  private createTables(): void {
    if (!this.db) return

    // Tabla de cursos
    this.db.run(`
      CREATE TABLE IF NOT EXISTS courses (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        color TEXT NOT NULL,
        createdAt TEXT NOT NULL
      )
    `)

    // Tabla de docentes
    this.db.run(`
      CREATE TABLE IF NOT EXISTS teachers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        createdAt TEXT NOT NULL
      )
    `)

    // Tabla de aulas
    this.db.run(`
      CREATE TABLE IF NOT EXISTS classrooms (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        capacity INTEGER NOT NULL,
        description TEXT,
        createdAt TEXT NOT NULL
      )
    `)

    // Tabla de reservas
    this.db.run(`
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
      )
    `)
  }

  private async loadInitialData(): Promise<void> {
    if (!this.db) return

    // Verificar si ya hay datos
    const coursesCount = this.db.exec("SELECT COUNT(*) FROM courses")[0].values[0][0] as number
    if (coursesCount > 0) return

    // Datos de ejemplo para cursos
    const defaultCourses: Course[] = [
      {
        id: "course-1",
        name: "Matemáticas",
        color: "#4CAF50",
        createdAt: new Date().toISOString(),
      },
      {
        id: "course-2",
        name: "Lenguaje",
        color: "#2196F3",
        createdAt: new Date().toISOString(),
      },
      {
        id: "course-3",
        name: "Ciencias",
        color: "#FF9800",
        createdAt: new Date().toISOString(),
      },
      {
        id: "course-4",
        name: "Historia",
        color: "#9C27B0",
        createdAt: new Date().toISOString(),
      },
      {
        id: "course-5",
        name: "Inglés",
        color: "#F44336",
        createdAt: new Date().toISOString(),
      },
    ]

    // Datos de ejemplo para docentes
    const defaultTeachers: Teacher[] = [
      {
        id: "teacher-1",
        name: "Juan Pérez",
        email: "juan.perez@ejemplo.com",
        createdAt: new Date().toISOString(),
      },
      {
        id: "teacher-2",
        name: "María López",
        email: "maria.lopez@ejemplo.com",
        createdAt: new Date().toISOString(),
      },
      {
        id: "teacher-3",
        name: "Carlos Rodríguez",
        email: "carlos.rodriguez@ejemplo.com",
        createdAt: new Date().toISOString(),
      },
    ]

    // Datos de ejemplo para aulas
    const defaultClassrooms: Classroom[] = [
      {
        id: "classroom-1",
        name: "Aula Funcional 101",
        capacity: 30,
        description: "Aula funcional principal",
        createdAt: new Date().toISOString(),
      },
      {
        id: "classroom-2",
        name: "Aula Funcional de Inglés",
        capacity: 25,
        description: "Aula especializada para idiomas",
        createdAt: new Date().toISOString(),
      },
      {
        id: "classroom-3",
        name: "Laboratorio de Ciencias",
        capacity: 20,
        description: "Laboratorio equipado para experimentos",
        createdAt: new Date().toISOString(),
      },
    ]

    // Insertar cursos
    for (const course of defaultCourses) {
      this.db.run("INSERT INTO courses (id, name, color, createdAt) VALUES (?, ?, ?, ?)", [
        course.id,
        course.name,
        course.color,
        course.createdAt,
      ])
    }

    // Insertar docentes
    for (const teacher of defaultTeachers) {
      this.db.run("INSERT INTO teachers (id, name, email, createdAt) VALUES (?, ?, ?, ?)", [
        teacher.id,
        teacher.name,
        teacher.email,
        teacher.createdAt,
      ])
    }

    // Insertar aulas
    for (const classroom of defaultClassrooms) {
      this.db.run("INSERT INTO classrooms (id, name, capacity, description, createdAt) VALUES (?, ?, ?, ?, ?)", [
        classroom.id,
        classroom.name,
        classroom.capacity,
        classroom.description || null,
        classroom.createdAt,
      ])
    }

    // Datos de ejemplo para reservas
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)

    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)

    const defaultReservations: Omit<Reservation, "courseName" | "courseColor" | "teacherName" | "classroom">[] = [
      {
        id: "reservation-1",
        courseId: "course-1",
        teacherId: "teacher-1",
        classroomId: "classroom-1",
        grade: "3°",
        section: "A",
        startTime: new Date(today.setHours(9, 0, 0, 0)).toISOString(),
        endTime: new Date(today.setHours(10, 30, 0, 0)).toISOString(),
        topic: "Ecuaciones de primer grado",
        status: "programado",
        createdAt: new Date(yesterday).toISOString(),
      },
      {
        id: "reservation-2",
        courseId: "course-2",
        teacherId: "teacher-2",
        classroomId: "classroom-2",
        grade: "4°",
        section: "B",
        startTime: new Date(today.setHours(11, 0, 0, 0)).toISOString(),
        endTime: new Date(today.setHours(12, 30, 0, 0)).toISOString(),
        topic: "Comprensión lectora",
        status: "en curso",
        createdAt: new Date(yesterday).toISOString(),
      },
      {
        id: "reservation-3",
        courseId: "course-3",
        teacherId: "teacher-3",
        classroomId: "classroom-3",
        grade: "5°",
        section: "C",
        startTime: new Date(yesterday.setHours(14, 0, 0, 0)).toISOString(),
        endTime: new Date(yesterday.setHours(15, 30, 0, 0)).toISOString(),
        topic: "Reacciones químicas",
        status: "finalizado",
        createdAt: new Date(yesterday.setDate(yesterday.getDate() - 1)).toISOString(),
      },
      {
        id: "reservation-4",
        courseId: "course-4",
        teacherId: "teacher-1",
        classroomId: "classroom-1",
        grade: "2°",
        section: "A",
        startTime: new Date(tomorrow.setHours(9, 0, 0, 0)).toISOString(),
        endTime: new Date(tomorrow.setHours(10, 30, 0, 0)).toISOString(),
        topic: "La Revolución Industrial",
        status: "programado",
        createdAt: new Date(today).toISOString(),
      },
      {
        id: "reservation-5",
        courseId: "course-5",
        teacherId: "teacher-2",
        classroomId: "classroom-2",
        grade: "1°",
        section: "B",
        startTime: new Date(tomorrow.setHours(11, 0, 0, 0)).toISOString(),
        endTime: new Date(tomorrow.setHours(12, 30, 0, 0)).toISOString(),
        topic: "Present Continuous",
        status: "programado",
        createdAt: new Date(today).toISOString(),
      },
    ]

    // Insertar reservas
    for (const reservation of defaultReservations) {
      this.db.run(
        `INSERT INTO reservations 
         (id, courseId, teacherId, classroomId, grade, section, startTime, endTime, topic, status, createdAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          reservation.id,
          reservation.courseId,
          reservation.teacherId,
          reservation.classroomId,
          reservation.grade,
          reservation.section,
          reservation.startTime,
          reservation.endTime,
          reservation.topic,
          reservation.status,
          reservation.createdAt,
        ],
      )
    }
  }

  // Métodos para cursos
  public async getAllCourses(): Promise<Course[]> {
    await this.initialize()
    if (!this.db) throw new Error("Database not initialized")

    const result = this.db.exec("SELECT * FROM courses")
    if (result.length === 0) return []

    const courses: Course[] = result[0].values.map((row: any[]) => ({
      id: row[0] as string,
      name: row[1] as string,
      color: row[2] as string,
      createdAt: row[3] as string,
    }))

    return courses
  }

  public async addCourse(course: Omit<Course, "id">): Promise<Course> {
    await this.initialize()
    if (!this.db) throw new Error("Database not initialized")

    const id = generateId()
    const newCourse: Course = {
      id,
      ...course,
      createdAt: new Date().toISOString(),
    }

    this.db.run("INSERT INTO courses (id, name, color, createdAt) VALUES (?, ?, ?, ?)", [
      newCourse.id,
      newCourse.name,
      newCourse.color,
      newCourse.createdAt,
    ])

    return newCourse
  }

  public async updateCourse(id: string, data: Partial<Course>): Promise<void> {
    await this.initialize()
    if (!this.db) throw new Error("Database not initialized")

    const setClauses = []
    const params = []

    if (data.name !== undefined) {
      setClauses.push("name = ?")
      params.push(data.name)
    }

    if (data.color !== undefined) {
      setClauses.push("color = ?")
      params.push(data.color)
    }

    if (setClauses.length === 0) return

    params.push(id)
    this.db.run(`UPDATE courses SET ${setClauses.join(", ")} WHERE id = ?`, params)
  }

  public async deleteCourse(id: string): Promise<void> {
    await this.initialize()
    if (!this.db) throw new Error("Database not initialized")

    // Verificar si hay reservas asociadas
    const reservationsResult = this.db.exec(`SELECT COUNT(*) FROM reservations WHERE courseId = '${id}'`)
    const reservationsCount = reservationsResult[0].values[0][0] as number

    if (reservationsCount > 0) {
      throw new Error("No se puede eliminar el curso porque tiene reservas asociadas")
    }

    this.db.run("DELETE FROM courses WHERE id = ?", [id])
  }

  // Métodos para docentes
  public async getAllTeachers(): Promise<Teacher[]> {
    await this.initialize()
    if (!this.db) throw new Error("Database not initialized")

    const result = this.db.exec("SELECT * FROM teachers")
    if (result.length === 0) return []

    const teachers: Teacher[] = result[0].values.map((row: any[]) => ({
      id: row[0] as string,
      name: row[1] as string,
      email: row[2] as string,
      createdAt: row[3] as string,
    }))

    return teachers
  }

  public async addTeacher(teacher: Omit<Teacher, "id">): Promise<Teacher> {
    await this.initialize()
    if (!this.db) throw new Error("Database not initialized")

    const id = generateId()
    const newTeacher: Teacher = {
      id,
      ...teacher,
      createdAt: new Date().toISOString(),
    }

    this.db.run("INSERT INTO teachers (id, name, email, createdAt) VALUES (?, ?, ?, ?)", [
      newTeacher.id,
      newTeacher.name,
      newTeacher.email,
      newTeacher.createdAt,
    ])

    return newTeacher
  }

  public async updateTeacher(id: string, data: Partial<Teacher>): Promise<void> {
    await this.initialize()
    if (!this.db) throw new Error("Database not initialized")

    const setClauses = []
    const params = []

    if (data.name !== undefined) {
      setClauses.push("name = ?")
      params.push(data.name)
    }

    if (data.email !== undefined) {
      setClauses.push("email = ?")
      params.push(data.email)
    }

    if (setClauses.length === 0) return

    params.push(id)
    this.db.run(`UPDATE teachers SET ${setClauses.join(", ")} WHERE id = ?`, params)
  }

  public async deleteTeacher(id: string): Promise<void> {
    await this.initialize()
    if (!this.db) throw new Error("Database not initialized")

    // Verificar si hay reservas asociadas
    const reservationsResult = this.db.exec(`SELECT COUNT(*) FROM reservations WHERE teacherId = '${id}'`)
    const reservationsCount = reservationsResult[0].values[0][0] as number

    if (reservationsCount > 0) {
      throw new Error("No se puede eliminar el docente porque tiene reservas asociadas")
    }

    this.db.run("DELETE FROM teachers WHERE id = ?", [id])
  }

  // Métodos para aulas
  public async getAllClassrooms(): Promise<Classroom[]> {
    await this.initialize()
    if (!this.db) throw new Error("Database not initialized")

    const result = this.db.exec("SELECT * FROM classrooms")
    if (result.length === 0) return []

    const classrooms: Classroom[] = result[0].values.map((row: any[]) => ({
      id: row[0] as string,
      name: row[1] as string,
      capacity: row[2] as number,
      description: row[3] as string | undefined,
      createdAt: row[4] as string,
    }))

    return classrooms
  }

  public async addClassroom(classroom: Omit<Classroom, "id">): Promise<Classroom> {
    await this.initialize()
    if (!this.db) throw new Error("Database not initialized")

    const id = generateId()
    const newClassroom: Classroom = {
      id,
      ...classroom,
      createdAt: new Date().toISOString(),
    }

    this.db.run("INSERT INTO classrooms (id, name, capacity, description, createdAt) VALUES (?, ?, ?, ?, ?)", [
      newClassroom.id,
      newClassroom.name,
      newClassroom.capacity,
      newClassroom.description || null,
      newClassroom.createdAt,
    ])

    return newClassroom
  }

  public async updateClassroom(id: string, data: Partial<Classroom>): Promise<void> {
    await this.initialize()
    if (!this.db) throw new Error("Database not initialized")

    const setClauses = []
    const params = []

    if (data.name !== undefined) {
      setClauses.push("name = ?")
      params.push(data.name)
    }

    if (data.capacity !== undefined) {
      setClauses.push("capacity = ?")
      params.push(data.capacity)
    }

    if (data.description !== undefined) {
      setClauses.push("description = ?")
      params.push(data.description)
    }

    if (setClauses.length === 0) return

    params.push(id)
    this.db.run(`UPDATE classrooms SET ${setClauses.join(", ")} WHERE id = ?`, params)
  }

  public async deleteClassroom(id: string): Promise<void> {
    await this.initialize()
    if (!this.db) throw new Error("Database not initialized")

    // Verificar si hay reservas asociadas
    const reservationsResult = this.db.exec(`SELECT COUNT(*) FROM reservations WHERE classroomId = '${id}'`)
    const reservationsCount = reservationsResult[0].values[0][0] as number

    if (reservationsCount > 0) {
      throw new Error("No se puede eliminar el aula porque tiene reservas asociadas")
    }

    this.db.run("DELETE FROM classrooms WHERE id = ?", [id])
  }

  // Métodos para reservas
  public async getAllReservations(): Promise<Reservation[]> {
    await this.initialize()
    if (!this.db) throw new Error("Database not initialized")

    const result = this.db.exec(`
      SELECT r.*, c.name as courseName, c.color as courseColor, t.name as teacherName, cl.name as classroom
      FROM reservations r
      JOIN courses c ON r.courseId = c.id
      JOIN teachers t ON r.teacherId = t.id
      JOIN classrooms cl ON r.classroomId = cl.id
    `)

    if (result.length === 0) return []

    const reservations: Reservation[] = result[0].values.map((row: any[]) => ({
      id: row[0] as string,
      courseId: row[1] as string,
      teacherId: row[2] as string,
      classroomId: row[3] as string,
      grade: row[4] as string,
      section: row[5] as string,
      startTime: row[6] as string,
      endTime: row[7] as string,
      topic: row[8] as string,
      status: row[9] as string,
      createdAt: row[10] as string,
      courseName: row[11] as string,
      courseColor: row[12] as string,
      teacherName: row[13] as string,
      classroom: row[14] as string,
    }))

    return reservations
  }

  public async addReservation(
    reservation: Omit<Reservation, "id" | "courseName" | "courseColor" | "teacherName" | "classroom">,
  ): Promise<Reservation> {
    await this.initialize()
    if (!this.db) throw new Error("Database not initialized")

    // Verificar si hay solapamiento de reservas
    const startTime = new Date(reservation.startTime).toISOString()
    const endTime = new Date(reservation.endTime).toISOString()

    const overlapResult = this.db.exec(`
      SELECT COUNT(*) FROM reservations 
      WHERE classroomId = '${reservation.classroomId}'
      AND (
        (startTime <= '${startTime}' AND endTime > '${startTime}') OR
        (startTime < '${endTime}' AND endTime >= '${endTime}') OR
        (startTime >= '${startTime}' AND endTime <= '${endTime}')
      )
    `)

    const overlapCount = overlapResult[0].values[0][0] as number

    if (overlapCount > 0) {
      throw new Error("Ya existe una reserva para esta aula en el horario seleccionado")
    }

    const id = generateId()
    const newReservation = {
      id,
      ...reservation,
      status: reservation.status || "programado",
      createdAt: new Date().toISOString(),
    }

    this.db.run(
      `INSERT INTO reservations 
       (id, courseId, teacherId, classroomId, grade, section, startTime, endTime, topic, status, createdAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newReservation.id,
        newReservation.courseId,
        newReservation.teacherId,
        newReservation.classroomId,
        newReservation.grade,
        newReservation.section,
        newReservation.startTime,
        newReservation.endTime,
        newReservation.topic,
        newReservation.status,
        newReservation.createdAt,
      ],
    )

    // Obtener los datos relacionados
    const courseResult = this.db.exec(`SELECT name, color FROM courses WHERE id = '${newReservation.courseId}'`)
    const teacherResult = this.db.exec(`SELECT name FROM teachers WHERE id = '${newReservation.teacherId}'`)
    const classroomResult = this.db.exec(`SELECT name FROM classrooms WHERE id = '${newReservation.classroomId}'`)

    const courseName = courseResult[0].values[0][0] as string
    const courseColor = courseResult[0].values[0][1] as string
    const teacherName = teacherResult[0].values[0][0] as string
    const classroom = classroomResult[0].values[0][0] as string

    return {
      ...newReservation,
      courseName,
      courseColor,
      teacherName,
      classroom,
    }
  }

  public async updateReservation(
    id: string,
    data: Partial<Omit<Reservation, "courseName" | "courseColor" | "teacherName" | "classroom">>,
  ): Promise<void> {
    await this.initialize()
    if (!this.db) throw new Error("Database not initialized")

    // Si hay cambios en fechas o aula, verificar solapamiento
    if ((data.startTime || data.endTime || data.classroomId) && (data.startTime || data.endTime || data.classroomId)) {
      // Obtener la reserva actual
      const currentResult = this.db.exec(`SELECT * FROM reservations WHERE id = '${id}'`)
      if (currentResult.length === 0) throw new Error("Reserva no encontrada")

      const current = {
        classroomId: data.classroomId || (currentResult[0].values[0][3] as string),
        startTime: data.startTime || (currentResult[0].values[0][6] as string),
        endTime: data.endTime || (currentResult[0].values[0][7] as string),
      }

      // Verificar solapamiento excluyendo esta reserva
      const overlapResult = this.db.exec(`
        SELECT COUNT(*) FROM reservations 
        WHERE id != '${id}'
        AND classroomId = '${current.classroomId}'
        AND (
          (startTime <= '${current.startTime}' AND endTime > '${current.startTime}') OR
          (startTime < '${current.endTime}' AND endTime >= '${current.endTime}') OR
          (startTime >= '${current.startTime}' AND endTime <= '${current.endTime}')
        )
      `)

      const overlapCount = overlapResult[0].values[0][0] as number

      if (overlapCount > 0) {
        throw new Error("Ya existe una reserva para esta aula en el horario seleccionado")
      }
    }

    const setClauses = []
    const params = []

    if (data.courseId !== undefined) {
      setClauses.push("courseId = ?")
      params.push(data.courseId)
    }

    if (data.teacherId !== undefined) {
      setClauses.push("teacherId = ?")
      params.push(data.teacherId)
    }

    if (data.classroomId !== undefined) {
      setClauses.push("classroomId = ?")
      params.push(data.classroomId)
    }

    if (data.grade !== undefined) {
      setClauses.push("grade = ?")
      params.push(data.grade)
    }

    if (data.section !== undefined) {
      setClauses.push("section = ?")
      params.push(data.section)
    }

    if (data.startTime !== undefined) {
      setClauses.push("startTime = ?")
      params.push(data.startTime)
    }

    if (data.endTime !== undefined) {
      setClauses.push("endTime = ?")
      params.push(data.endTime)
    }

    if (data.topic !== undefined) {
      setClauses.push("topic = ?")
      params.push(data.topic)
    }

    if (data.status !== undefined) {
      setClauses.push("status = ?")
      params.push(data.status)
    }

    if (setClauses.length === 0) return

    params.push(id)
    this.db.run(`UPDATE reservations SET ${setClauses.join(", ")} WHERE id = ?`, params)
  }

  public async updateReservationStatus(id: string, status: string): Promise<void> {
    await this.initialize()
    if (!this.db) throw new Error("Database not initialized")

    this.db.run("UPDATE reservations SET status = ? WHERE id = ?", [status, id])
  }

  public async deleteReservation(id: string): Promise<void> {
    await this.initialize()
    if (!this.db) throw new Error("Database not initialized")

    this.db.run("DELETE FROM reservations WHERE id = ?", [id])
  }

  // Método para exportar la base de datos como un archivo
  public exportDatabase(): Uint8Array {
    if (!this.db) throw new Error("Database not initialized")
    return this.db.export()
  }

  // Método para cerrar la base de datos
  public close(): void {
    if (this.db) {
      this.db.close()
      this.db = null
      this.initialized = false
      this.initializationPromise = null
    }
  }
}

// Exportar una instancia del servicio de base de datos
export const sqliteDB = SQLiteDB.getInstance()
