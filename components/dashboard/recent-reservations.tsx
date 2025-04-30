"use client"

import { useSchedule } from "@/context/schedule-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { getStatusColor } from "@/lib/colors"

export function RecentReservations() {
  const { recentReservations } = useSchedule()
  const router = useRouter()

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Reservas Recientes</CardTitle>
        <CardDescription>Las últimas 5 reservas registradas en el sistema.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentReservations.map((reservation) => {
            const statusColor = getStatusColor(reservation.status, reservation.courseColor)

            return (
              <div key={reservation.id} className="flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-10 rounded-full" style={{ backgroundColor: statusColor }} />
                  <div>
                    <p className="text-sm font-medium leading-none">{reservation.courseName}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(reservation.startTime)} - {reservation.classroom}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="capitalize"
                  style={{
                    backgroundColor: `${statusColor}20`,
                    color: statusColor,
                    borderColor: statusColor,
                  }}
                >
                  {reservation.status}
                </Badge>
              </div>
            )
          })}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={() => router.push("/reservations")}>
          Ver todas las reservas
        </Button>
      </CardFooter>
    </Card>
  )
}
