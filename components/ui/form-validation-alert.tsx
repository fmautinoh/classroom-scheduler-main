"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AlertCircle } from "lucide-react"

interface FormValidationAlertProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  errors?: string[]
}

export function FormValidationAlert({
  open,
  onOpenChange,
  title = "Error de Validación",
  description = "Por favor corrija los siguientes errores:",
  errors = [],
}: FormValidationAlertProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
          {errors.length > 0 && (
            <ul className="mt-2 list-disc pl-5 text-sm">
              {errors.map((error, index) => (
                <li key={index} className="text-destructive">
                  {error}
                </li>
              ))}
            </ul>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction>Entendido</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
