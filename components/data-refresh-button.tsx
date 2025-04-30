"use client"

import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useSchedule } from "@/context/schedule-context"
import { RefreshCw } from "lucide-react"
import { useState } from "react"

export function DataRefreshButton() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { refreshData } = useSchedule()
  const { toast } = useToast()

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshData()
      toast({
        title: "Datos actualizados",
        description: "Los datos han sido actualizados correctamente.",
      })
    } catch (error) {
      toast({
        title: "Error al actualizar",
        description: "No se pudieron actualizar los datos. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
      <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
      <span className="sr-only">Actualizar datos</span>
    </Button>
  )
}
