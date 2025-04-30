// Definición de tipos para el sistema

// Curso
export interface Course {
  id: string
  name: string
  color: string
  createdAt: string
}

// Docente
export interface Teacher {
  id: string
  name: string
  email: string
  createdAt: string
}

// Aula
export interface Classroom {
  id: string
  name: string
  capacity: number
  description?: string
  createdAt: string
}

// Reserva
export interface Reservation {
  id: string
  courseId: string
  teacherId: string
  classroomId: string
  grade: string
  section: string
  startTime: string
  endTime: string
  topic: string
  status: string
  createdAt: string
  // Campos calculados para mostrar en la UI
  courseName: string
  courseColor: string
  teacherName: string
  classroom: string
}

// Datos de reporte
export type ReportData = Reservation

// Estadísticas
export interface Stats {
  totalReservations: number
  newReservationsToday: number
  activeClassrooms: number
  totalClassrooms: number
  totalTeachers: number
  activeTeachers: number
  totalCourses: number
  activeCourses: number
}
