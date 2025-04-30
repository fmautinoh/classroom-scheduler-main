// Colores predefinidos para los cursos
export const COURSE_COLORS = [
  "#4CAF50", // Verde
  "#2196F3", // Azul
  "#FF9800", // Naranja
  "#9C27B0", // Púrpura
  "#F44336", // Rojo
  "#3F51B5", // Índigo
  "#009688", // Verde azulado
  "#795548", // Marrón
  "#607D8B", // Gris azulado
  "#E91E63", // Rosa
  "#673AB7", // Violeta
  "#FFC107", // Ámbar
]

// Función para obtener el color según el estado
export const getStatusColor = (status: string, baseColor: string): string => {
  switch (status) {
    case "programado":
      // Color más gris (mezcla con gris)
      return addOpacity(baseColor, 0.6)
    case "en curso":
      // Color más vivo
      return baseColor
    case "finalizado":
      // Color más oscuro
      return darkenColor(baseColor, 0.2)
    default:
      return baseColor
  }
}

// Función para añadir opacidad a un color (mezclarlo con blanco)
function addOpacity(color: string, opacity: number): string {
  // Convertir hex a RGB
  const r = Number.parseInt(color.slice(1, 3), 16)
  const g = Number.parseInt(color.slice(3, 5), 16)
  const b = Number.parseInt(color.slice(5, 7), 16)

  // Mezclar con blanco según la opacidad
  const r2 = Math.round(r * opacity + 255 * (1 - opacity))
  const g2 = Math.round(g * opacity + 255 * (1 - opacity))
  const b2 = Math.round(b * opacity + 255 * (1 - opacity))

  // Convertir de nuevo a hex
  return `#${r2.toString(16).padStart(2, "0")}${g2.toString(16).padStart(2, "0")}${b2.toString(16).padStart(2, "0")}`
}

// Función para oscurecer un color
function darkenColor(color: string, amount: number): string {
  // Convertir hex a RGB
  const r = Number.parseInt(color.slice(1, 3), 16)
  const g = Number.parseInt(color.slice(3, 5), 16)
  const b = Number.parseInt(color.slice(5, 7), 16)

  // Oscurecer
  const r2 = Math.round(r * (1 - amount))
  const g2 = Math.round(g * (1 - amount))
  const b2 = Math.round(b * (1 - amount))

  // Convertir de nuevo a hex
  return `#${r2.toString(16).padStart(2, "0")}${g2.toString(16).padStart(2, "0")}${b2.toString(16).padStart(2, "0")}`
}
