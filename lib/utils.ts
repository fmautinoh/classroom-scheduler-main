import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

export function formatDate(dateString: string, timeOnly = false): string {
  const date = new Date(dateString)

  if (timeOnly) {
    return format(date, "HH:mm", { locale: es })
  }

  return format(date, "dd MMM yyyy HH:mm", { locale: es })
}
