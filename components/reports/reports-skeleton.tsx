import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function ReportsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-[250px]" />
        <Skeleton className="h-4 w-[180px]" />
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="table">
          <TabsList className="mb-4">
            <TabsTrigger value="table">Tabla</TabsTrigger>
            <TabsTrigger value="chart">Gráfico</TabsTrigger>
          </TabsList>
          <TabsContent value="table">
            <div className="flex justify-end mb-4">
              <Skeleton className="h-8 w-[120px]" />
            </div>
            <div className="rounded-md border">
              <div className="h-[400px] w-full">
                <div className="flex items-center px-4 py-3 border-b">
                  <Skeleton className="h-4 w-[100px] mr-4" />
                  <Skeleton className="h-4 w-[100px] mr-4" />
                  <Skeleton className="h-4 w-[100px] mr-4" />
                  <Skeleton className="h-4 w-[100px] mr-4" />
                  <Skeleton className="h-4 w-[100px] mr-4" />
                  <Skeleton className="h-4 w-[100px]" />
                </div>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center px-4 py-3 border-b">
                    <Skeleton className="h-4 w-[100px] mr-4" />
                    <Skeleton className="h-4 w-[100px] mr-4" />
                    <Skeleton className="h-4 w-[100px] mr-4" />
                    <Skeleton className="h-4 w-[100px] mr-4" />
                    <Skeleton className="h-4 w-[100px] mr-4" />
                    <Skeleton className="h-4 w-[100px]" />
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="chart">
            <div className="h-[400px] w-full">
              <Skeleton className="h-full w-full" />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
