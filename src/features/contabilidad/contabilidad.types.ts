export interface ExportacionContpaqiRead {
  id: string
  periodo_inicio: string // ISO date
  periodo_fin: string // ISO date
  notas?: string
  estatus: string
  archivo_nombre?: string
  total_registros?: number
  generado_por_id: string
  creado_en: string
}

export interface ExportarRequest {
  periodo_inicio: string
  periodo_fin: string
  notas?: string
}
