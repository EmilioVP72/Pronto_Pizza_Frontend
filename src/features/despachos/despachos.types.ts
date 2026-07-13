import type { EstatusDespacho, TipoDocumento } from '@/types/enums'

export interface DespachoRead {
  id: string
  sucursal_origen_id: string
  sucursal_destino_id: string
  folio: string
  estatus: EstatusDespacho
  tipo_documento: TipoDocumento | null
  requisicion_id: string | null
  creado_por_id: string
  creado_en: string
  actualizado_en: string
}

export interface DespachoCreate {
  sucursal_destino_id: string
  requisicion_id?: string | null
  notas?: string | null
}
