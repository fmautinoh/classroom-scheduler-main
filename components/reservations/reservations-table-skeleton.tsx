import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function ReservationsTableSkeleton() {
  return (
    <Card>
      <CardHeader className="px-6 py-4">
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[700px] flex items-center justify-center">
          <Skeleton className="h-[90%] w-[95%]" />
        </div>
      </CardContent>
    </Card>
  )
}
