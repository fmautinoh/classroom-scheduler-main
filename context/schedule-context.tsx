"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Course, Teacher, Classroom, Reservation, ReportData, Stats } from "@/types/schema"
import { db } from "@/lib/db"
import { generateId } from "@/lib/utils"

interface ScheduleContextType {
  courses: Course[]
  teachers: Teacher[]
  classrooms: Classroom[]
  reservations: Reservation[]
  recentReservations: Reservation[]
  stats: Stats
  reportData: ReportData[]
  reportFilters: any
  refreshData: () => Promise<void>
  addCourse: (course: Omit<Course, "id">) => Promise<void>
  updateCourse: (id: string, course: Partial<Course>) => Promise<void>
  deleteCourse: (id: string) => Promise<void>
  addTeacher: (teacher: Omit<Teacher, "id">) => Promise<void>
  updateTeacher: (id: string, teacher: Partial<Teacher>) => Promise<void>
  deleteTeacher: (id: string) => Promise<void>
  addClassroom: (classroom: Omit<Classroom, "id">) => Promise<void>
  updateClassroom: (id: string, classroom: Partial<Classroom>) => Promise<void>
  deleteClassroom: (id: string) => Promise<void>
  addReservation: (reservation: any) => Promise<void>
  updateReservation: (id: string, reservation: any) => Promise<void>
  updateReservationStatus: (id: string, status: string) => Promise<void>
  deleteReservation: (id: string) => Promise<void>
  generateReport: (filters: any) => Promise<void>
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined)

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [courses, setCourses] = useState<Course[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [recentReservations, setRecentReservations] = useState<Reservation[]>([])
  const [stats, setStats] = useState<Stats>({
    totalReservations: 0,
    newReservationsToday: 0,
    activeClassrooms: 0,
    totalClassrooms: 0,
    totalTeachers: 0,
    activeTeachers: 0,
    totalCourses: 0,
    activeCourses: 0,
  })
  const [reportData, setReportData] = useState<ReportData[]>([])
  const [reportFilters, setReportFilters] = useState<any>(null)

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        await refreshData()
      } catch (error) {
        console.error("Error loading initial data:", error)
      }
    }

    loadData()
  }, [])

  // Refresh all data
  const refreshData = async () => {
    try {
      // Load courses
      const coursesData = await db.courses.getAll()
      setCourses(coursesData)

      // Load teachers
      const teachersData = await db.teachers.getAll()
      setTeachers(teachersData)

      // Load classrooms
      const classroomsData = await db.classrooms.getAll()
      setClassrooms(classroomsData)

      // Load reservations
      const reservationsData = await db.reservations.getAll()

      // Enrich reservations with related data
      const enrichedReservations = reservationsData.map((reservation) => {
        const course = coursesData.find((c) => c.id === reservation.courseId)
        const teacher = teachersData.find((t) => t.id === reservation.teacherId)
        const classroom = classroomsData.find((c) => c.id === reservation.classroomId)

        return {
          ...reservation,
          courseName: course?.name || "Curso desconocido",
          courseColor: course?.color || "#cccccc",
          teacherName: teacher?.name || "Docente desconocido",
          classroom: classroom?.name || "Aula desconocida",
        }
      })

      setReservations(enrichedReservations)

      // Set recent reservations (last 5)
      const sortedReservations = [...enrichedReservations].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      setRecentReservations(sortedReservations.slice(0, 5))

      // Calculate stats
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const newReservationsToday = reservationsData.filter((r) => new Date(r.createdAt) >= today).length

      const activeClassroomsIds = new Set(
        reservationsData.filter((r) => new Date(r.startTime) >= today).map((r) => r.classroomId),
      )

      const activeTeachersIds = new Set(
        reservationsData
          .filter((r) => {
            const reservationDate = new Date(r.startTime)
            const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
            return reservationDate >= firstDayOfMonth
          })
          .map((r) => r.teacherId),
      )

      const activeCoursesIds = new Set(
        reservationsData
          .filter((r) => {
            const reservationDate = new Date(r.startTime)
            const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
            return reservationDate >= firstDayOfMonth
          })
          .map((r) => r.courseId),
      )

      setStats({
        totalReservations: reservationsData.length,
        newReservationsToday,
        activeClassrooms: activeClassroomsIds.size,
        totalClassrooms: classroomsData.length,
        totalTeachers: teachersData.length,
        activeTeachers: activeTeachersIds.size,
        totalCourses: coursesData.length,
        activeCourses: activeCoursesIds.size,
      })
    } catch (error) {
      console.error("Error refreshing data:", error)
      throw error
    }
  }

  // Course CRUD operations
  const addCourse = async (course: Omit<Course, "id">) => {
    try {
      const newCourse = {
        id: generateId(),
        ...course,
        createdAt: new Date().toISOString(),
      }

      await db.courses.add(newCourse)
      setCourses((prev) => [...prev, newCourse])
    } catch (error) {
      console.error("Error adding course:", error)
      throw error
    }
  }

  const updateCourse = async (id: string, course: Partial<Course>) => {
    try {
      await db.courses.update(id, course)
      setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, ...course } : c)))

      // Update course name and color in reservations if needed
      if (course.name || course.color) {
        setReservations((prev) =>
          prev.map((r) => {
            if (r.courseId === id) {
              return {
                ...r,
                ...(course.name && { courseName: course.name }),
                ...(course.color && { courseColor: course.color }),
              }
            }
            return r
          }),
        )

        setRecentReservations((prev) =>
          prev.map((r) => {
            if (r.courseId === id) {
              return {
                ...r,
                ...(course.name && { courseName: course.name }),
                ...(course.color && { courseColor: course.color }),
              }
            }
            return r
          }),
        )
      }
    } catch (error) {
      console.error("Error updating course:", error)
      throw error
    }
  }

  const deleteCourse = async (id: string) => {
    try {
      // Check if course is used in any reservation
      const courseReservations = reservations.filter((r) => r.courseId === id)
      if (courseReservations.length > 0) {
        throw new Error("No se puede eliminar el curso porque tiene reservas asociadas")
      }

      await db.courses.remove(id)
      setCourses((prev) => prev.filter((c) => c.id !== id))
    } catch (error) {
      console.error("Error deleting course:", error)
      throw error
    }
  }

  // Teacher CRUD operations
  const addTeacher = async (teacher: Omit<Teacher, "id">) => {
    try {
      const newTeacher = {
        id: generateId(),
        ...teacher,
        createdAt: new Date().toISOString(),
      }

      await db.teachers.add(newTeacher)
      setTeachers((prev) => [...prev, newTeacher])
    } catch (error) {
      console.error("Error adding teacher:", error)
      throw error
    }
  }

  const updateTeacher = async (id: string, teacher: Partial<Teacher>) => {
    try {
      await db.teachers.update(id, teacher)
      setTeachers((prev) => prev.map((t) => (t.id === id ? { ...t, ...teacher } : t)))

      // Update teacher name in reservations if needed
      if (teacher.name) {
        setReservations((prev) =>
          prev.map((r) => {
            if (r.teacherId === id) {
              return { ...r, teacherName: teacher.name }
            }
            return r
          }),
        )

        setRecentReservations((prev) =>
          prev.map((r) => {
            if (r.teacherId === id) {
              return { ...r, teacherName: teacher.name }
            }
            return r
          }),
        )
      }
    } catch (error) {
      console.error("Error updating teacher:", error)
      throw error
    }
  }

  const deleteTeacher = async (id: string) => {
    try {
      // Check if teacher is used in any reservation
      const teacherReservations = reservations.filter((r) => r.teacherId === id)
      if (teacherReservations.length > 0) {
        throw new Error("No se puede eliminar el docente porque tiene reservas asociadas")
      }

      await db.teachers.remove(id)
      setTeachers((prev) => prev.filter((t) => t.id !== id))
    } catch (error) {
      console.error("Error deleting teacher:", error)
      throw error
    }
  }

  // Classroom CRUD operations
  const addClassroom = async (classroom: Omit<Classroom, "id">) => {
    try {
      const newClassroom = {
        id: generateId(),
        ...classroom,
        createdAt: new Date().toISOString(),
      }

      await db.classrooms.add(newClassroom)
      setClassrooms((prev) => [...prev, newClassroom])
    } catch (error) {
      console.error("Error adding classroom:", error)
      throw error
    }
  }

  const updateClassroom = async (id: string, classroom: Partial<Classroom>) => {
    try {
      await db.classrooms.update(id, classroom)
      setClassrooms((prev) => prev.map((c) => (c.id === id ? { ...c, ...classroom } : c)))

      // Update classroom name in reservations if needed
      if (classroom.name) {
        setReservations((prev) =>
          prev.map((r) => {
            if (r.classroomId === id) {
              return { ...r, classroom: classroom.name }
            }
            return r
          }),
        )

        setRecentReservations((prev) =>
          prev.map((r) => {
            if (r.classroomId === id) {
              return { ...r, classroom: classroom.name }
            }
            return r
          }),
        )
      }
    } catch (error) {
      console.error("Error updating classroom:", error)
      throw error
    }
  }

  const deleteClassroom = async (id: string) => {
    try {
      // Check if classroom is used in any reservation
      const classroomReservations = reservations.filter((r) => r.classroomId === id)
      if (classroomReservations.length > 0) {
        throw new Error("No se puede eliminar el aula porque tiene reservas asociadas")
      }

      await db.classrooms.remove(id)
      setClassrooms((prev) => prev.filter((c) => c.id !== id))
    } catch (error) {
      console.error("Error deleting classroom:", error)
      throw error
    }
  }

  // Reservation CRUD operations
  const addReservation = async (reservation: any) => {
    try {
      const course = courses.find((c) => c.id === reservation.courseId)
      const teacher = teachers.find((t) => t.id === reservation.teacherId)
      const classroom = classrooms.find((c) => c.id === reservation.classroomId)

      if (!course || !teacher || !classroom) {
        throw new Error("Datos de reserva inválidos")
      }

      // Check for overlapping reservations
      const isOverlapping = reservations.some((r) => {
        if (r.classroomId !== reservation.classroomId) return false

        const newStart = new Date(reservation.startTime).getTime()
        const newEnd = new Date(reservation.endTime).getTime()
        const existingStart = new Date(r.startTime).getTime()
        const existingEnd = new Date(r.endTime).getTime()

        return (
          (newStart >= existingStart && newStart < existingEnd) ||
          (newEnd > existingStart && newEnd <= existingEnd) ||
          (newStart <= existingStart && newEnd >= existingEnd)
        )
      })

      if (isOverlapping) {
        throw new Error("Ya existe una reserva para esta aula en el horario seleccionado")
      }

      const newReservation = {
        id: generateId(),
        ...reservation,
        status: reservation.status || "programado",
        createdAt: new Date().toISOString(),
        courseName: course.name,
        courseColor: course.color,
        teacherName: teacher.name,
        classroom: classroom.name,
      }

      await db.reservations.add(newReservation)

      setReservations((prev) => [...prev, newReservation])

      // Update recent reservations
      const updatedRecentReservations = [newReservation, ...recentReservations].slice(0, 5)
      setRecentReservations(updatedRecentReservations)

      // Update stats
      setStats((prev) => ({
        ...prev,
        totalReservations: prev.totalReservations + 1,
        newReservationsToday: prev.newReservationsToday + 1,
      }))
    } catch (error) {
      console.error("Error adding reservation:", error)
      throw error
    }
  }

  const updateReservation = async (id: string, reservation: any) => {
    try {
      const existingReservation = reservations.find((r) => r.id === id)
      if (!existingReservation) {
        throw new Error("Reserva no encontrada")
      }

      const course = courses.find((c) => c.id === reservation.courseId)
      const teacher = teachers.find((t) => t.id === reservation.teacherId)
      const classroom = classrooms.find((c) => c.id === reservation.classroomId)

      if (!course || !teacher || !classroom) {
        throw new Error("Datos de reserva inválidos")
      }

      // Check for overlapping reservations (excluding this reservation)
      const isOverlapping = reservations.some((r) => {
        if (r.id === id || r.classroomId !== reservation.classroomId) return false

        const newStart = new Date(reservation.startTime).getTime()
        const newEnd = new Date(reservation.endTime).getTime()
        const existingStart = new Date(r.startTime).getTime()
        const existingEnd = new Date(r.endTime).getTime()

        return (
          (newStart >= existingStart && newStart < existingEnd) ||
          (newEnd > existingStart && newEnd <= existingEnd) ||
          (newStart <= existingStart && newEnd >= existingEnd)
        )
      })

      if (isOverlapping) {
        throw new Error("Ya existe una reserva para esta aula en el horario seleccionado")
      }

      const updatedReservation = {
        ...existingReservation,
        ...reservation,
        courseName: course.name,
        courseColor: course.color,
        teacherName: teacher.name,
        classroom: classroom.name,
      }

      await db.reservations.update(id, reservation)

      setReservations((prev) => prev.map((r) => (r.id === id ? updatedReservation : r)))

      // Update recent reservations if needed
      setRecentReservations((prev) => prev.map((r) => (r.id === id ? updatedReservation : r)))
    } catch (error) {
      console.error("Error updating reservation:", error)
      throw error
    }
  }

  const updateReservationStatus = async (id: string, status: string) => {
    try {
      await db.reservations.updateStatus(id, status)

      setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))

      // Update recent reservations if needed
      setRecentReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))
    } catch (error) {
      console.error("Error updating reservation status:", error)
      throw error
    }
  }

  const deleteReservation = async (id: string) => {
    try {
      await db.reservations.remove(id)

      setReservations((prev) => prev.filter((r) => r.id !== id))

      // Update recent reservations if needed
      setRecentReservations((prev) => prev.filter((r) => r.id !== id))

      // Update stats
      setStats((prev) => ({
        ...prev,
        totalReservations: prev.totalReservations - 1,
      }))
    } catch (error) {
      console.error("Error deleting reservation:", error)
      throw error
    }
  }

  // Generate report
  const generateReport = async (filters: any) => {
    try {
      setReportFilters(filters)

      // Filter reservations based on criteria
      let filteredReservations = [...reservations]

      // Filter by teacher or course
      if (filters.type === "teacher" && filters.teacherId) {
        filteredReservations = filteredReservations.filter((r) => r.teacherId === filters.teacherId)
      } else if (filters.type === "course" && filters.courseId) {
        filteredReservations = filteredReservations.filter((r) => r.courseId === filters.courseId)
      }

      // Filter by date period
      const today = new Date()
      let startDate: Date
      let endDate: Date

      switch (filters.period) {
        case "week":
          // Start of current week (Sunday)
          startDate = new Date(today)
          startDate.setDate(today.getDate() - today.getDay())
          startDate.setHours(0, 0, 0, 0)

          // End of current week (Saturday)
          endDate = new Date(startDate)
          endDate.setDate(startDate.getDate() + 6)
          endDate.setHours(23, 59, 59, 999)
          break

        case "month":
          // Start of current month
          startDate = new Date(today.getFullYear(), today.getMonth(), 1)

          // End of current month
          endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999)
          break

        case "year":
          // Start of current year
          startDate = new Date(today.getFullYear(), 0, 1)

          // End of current year
          endDate = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999)
          break

        case "custom":
          // Custom date range
          startDate = new Date(filters.startDate)
          startDate.setHours(0, 0, 0, 0)

          endDate = new Date(filters.endDate)
          endDate.setHours(23, 59, 59, 999)
          break

        default:
          startDate = new Date(0) // Beginning of time
          endDate = new Date(8640000000000000) // End of time
      }

      filteredReservations = filteredReservations.filter((r) => {
        const reservationDate = new Date(r.startTime)
        return reservationDate >= startDate && reservationDate <= endDate
      })

      // Sort by date
      filteredReservations.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())

      // Set report data
      setReportData(filteredReservations)

      return filteredReservations
    } catch (error) {
      console.error("Error generating report:", error)
      throw error
    }
  }

  const contextValue: ScheduleContextType = {
    courses,
    teachers,
    classrooms,
    reservations,
    recentReservations,
    stats,
    reportData,
    reportFilters,
    refreshData,
    addCourse,
    updateCourse,
    deleteCourse,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    addClassroom,
    updateClassroom,
    deleteClassroom,
    addReservation,
    updateReservation,
    updateReservationStatus,
    deleteReservation,
    generateReport,
  }

  return <ScheduleContext.Provider value={contextValue}>{children}</ScheduleContext.Provider>
}

export function useSchedule() {
  const context = useContext(ScheduleContext)
  if (context === undefined) {
    throw new Error("useSchedule must be used within a ScheduleProvider")
  }
  return context
}
