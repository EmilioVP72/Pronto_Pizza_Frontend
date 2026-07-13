export interface ExportacionContpaqiRead {
  id: string
  sucursal_id: string
  fecha_inicio: string // ISO date
  fecha_fin: string // ISO date
  generado_por_id: string
  creado_en: string
  url_archivo?: string
}

export interface ExportarRequest {
  sucursal_id: string
  fecha_inicio: string
  fecha_fin: string
}
