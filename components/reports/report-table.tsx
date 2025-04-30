"use client"

import { useState } from "react"
import type { ReportData } from "@/types/schema"
import { formatDate } from "@/lib/utils"
import { getStatusColor } from "@/lib/colors"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ChevronDown, Download } from "lucide-react"

interface ReportTableProps {
  data: ReportData[]
}

export function ReportTable({ data }: ReportTableProps) {
  const [sortColumn, setSortColumn] = useState<string>("startTime")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const sortedData = [...data].sort((a, b) => {
    const aValue = a[sortColumn as keyof ReportData]
    const bValue = b[sortColumn as keyof ReportData]

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }

    // Handle dates
    if (sortColumn === "startTime" || sortColumn === "endTime") {
      const aDate = new Date(a[sortColumn]).getTime()
      const bDate = new Date(b[sortColumn]).getTime()
      return sortDirection === "asc" ? aDate - bDate : bDate - aDate
    }

    return 0
  })

  const exportCSV = () => {
    const headers = [
      "Fecha",
      "Hora Inicio",
      "Hora Fin",
      "Curso",
      "Docente",
      "Aula",
      "Grado",
      "Sección",
      "Estado",
      "Tema",
    ]

    const csvRows = [
      headers.join(","),
      ...sortedData.map((row) => {
        const startDate = new Date(row.startTime)
        const endDate = new Date(row.endTime)

        return [
          format(startDate, "yyyy-MM-dd"),
          format(startDate, "HH:mm"),
          format(endDate, "HH:mm"),
          `"${row.courseName}"`,
          `"${row.teacherName}"`,
          `"${row.classroom}"`,
          row.grade,
          row.section,
          row.status,
          `"${row.topic.replace(/"/g, '""')}"`,
        ].join(",")
      }),
    ]

    const csvContent = csvRows.join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "reporte.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const format = (date: Date, formatStr: string) => {
    const pad = (num: number) => num.toString().padStart(2, "0")

    if (formatStr === "yyyy-MM-dd") {
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
    }

    if (formatStr === "HH:mm") {
      return `${pad(date.getHours())}:${pad(date.getMinutes())}`
    }

    return date.toISOString()
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Exportar
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={exportCSV}>Exportar CSV</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => handleSort("startTime")}>
                Fecha y Hora
                {sortColumn === "startTime" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("courseName")}>
                Curso
                {sortColumn === "courseName" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("teacherName")}>
                Docente
                {sortColumn === "teacherName" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("classroom")}>
                Aula
                {sortColumn === "classroom" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("grade")}>
                Grado/Sección
                {sortColumn === "grade" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("status")}>
                Estado
                {sortColumn === "status" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
              </TableHead>
              <TableHead>Tema</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((row) => {
              const statusColor = getStatusColor(row.status, row.courseColor)

              return (
                <TableRow key={row.id}>
                  <TableCell>
                    {formatDate(row.startTime)} - {formatDate(row.endTime, true)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-4 rounded-full" style={{ backgroundColor: row.courseColor }} />
                      {row.courseName}
                    </div>
                  </TableCell>
                  <TableCell>{row.teacherName}</TableCell>
                  <TableCell>{row.classroom}</TableCell>
                  <TableCell>
                    {row.grade} {row.section}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="capitalize"
                      style={{
                        backgroundColor: `${statusColor}20`,
                        color: statusColor,
                        borderColor: statusColor,
                      }}
                    >
                      {row.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate" title={row.topic}>
                    {row.topic}
                  </TableCell>
                </TableRow>
              )
            })}

            {sortedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No hay datos disponibles
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
