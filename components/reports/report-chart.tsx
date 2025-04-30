"use client"

import { useState, useEffect } from "react"
import type { ReportData } from "@/types/schema"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface ReportChartProps {
  data: ReportData[]
}

export function ReportChart({ data }: ReportChartProps) {
  const [statusData, setStatusData] = useState<any[]>([])
  const [hourlyData, setHourlyData] = useState<any[]>([])
  const [weekdayData, setWeekdayData] = useState<any[]>([])

  useEffect(() => {
    // Process status data for pie chart
    const statusCounts = data.reduce(
      (acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const statusChartData = Object.entries(statusCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }))

    setStatusData(statusChartData)

    // Process hourly data for bar chart
    const hourCounts = data.reduce(
      (acc, item) => {
        const hour = new Date(item.startTime).getHours()
        acc[hour] = (acc[hour] || 0) + 1
        return acc
      },
      {} as Record<number, number>,
    )

    const hourlyChartData = Object.entries(hourCounts)
      .map(([hour, count]) => ({
        hour: `${hour}:00`,
        count,
      }))
      .sort((a, b) => Number.parseInt(a.hour) - Number.parseInt(b.hour))

    setHourlyData(hourlyChartData)

    // Process weekday data for bar chart
    const weekdays = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
    const weekdayCounts = data.reduce(
      (acc, item) => {
        const weekday = new Date(item.startTime).getDay()
        acc[weekday] = (acc[weekday] || 0) + 1
        return acc
      },
      {} as Record<number, number>,
    )

    const weekdayChartData = Object.entries(weekdayCounts)
      .map(([day, count]) => ({
        day: weekdays[Number.parseInt(day)],
        count,
      }))
      .sort((a, b) => {
        const dayOrder = {
          Lunes: 0,
          Martes: 1,
          Miércoles: 2,
          Jueves: 3,
          Viernes: 4,
          Sábado: 5,
          Domingo: 6,
        }
        return dayOrder[a.day as keyof typeof dayOrder] - dayOrder[b.day as keyof typeof dayOrder]
      })

    setWeekdayData(weekdayChartData)
  }, [data])

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  return (
    <Tabs defaultValue="status">
      <TabsList className="mb-4">
        <TabsTrigger value="status">Por Estado</TabsTrigger>
        <TabsTrigger value="hourly">Por Hora</TabsTrigger>
        <TabsTrigger value="weekday">Por Día</TabsTrigger>
      </TabsList>

      <TabsContent value="status">
        <Card>
          <CardContent className="pt-6">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} reservas`, "Cantidad"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="hourly">
        <Card>
          <CardContent className="pt-6">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={hourlyData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} reservas`, "Cantidad"]} />
                  <Legend />
                  <Bar dataKey="count" name="Reservas" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="weekday">
        <Card>
          <CardContent className="pt-6">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weekdayData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} reservas`, "Cantidad"]} />
                  <Legend />
                  <Bar dataKey="count" name="Reservas" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
