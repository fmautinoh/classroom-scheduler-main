"use client"

import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ViewSelectorProps {
  currentView: string
}

export function ViewSelector({ currentView }: ViewSelectorProps) {
  const router = useRouter()

  const handleViewChange = (value: string) => {
    router.push(`/reservations/${value}`)
  }

  return (
    <Select value={currentView} onValueChange={handleViewChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Seleccionar vista" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="month">Mes</SelectItem>
        <SelectItem value="week">Semana</SelectItem>
        <SelectItem value="day">Día</SelectItem>
        <SelectItem value="list">Lista</SelectItem>
      </SelectContent>
    </Select>
  )
}
