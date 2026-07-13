import type { EstatusOrdenProduccion } from '@/types/enums'

export interface OrdenProduccionRead {
  id: string
  sucursal_id: string
  folio: string
  receta_id: string
  receta_nombre: string
  tandas: number
  estatus: EstatusOrdenProduccion
  lote_resultado_id: string | null
  creado_por_id: string
  creado_en: string
  actualizado_en: string
}

export interface OrdenProduccionCreate {
  receta_id: string
  tandas: number
  notas?: string | null
}
