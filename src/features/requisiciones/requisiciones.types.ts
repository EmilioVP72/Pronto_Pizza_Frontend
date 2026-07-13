import type { EstatusRequisicion } from '@/types/enums'

export interface RequisicionRead {
  id: string
  sucursal_id: string
  folio: string
  estatus: EstatusRequisicion
  fecha_requerida: string | null   // ISO date
  notas: string | null
  creado_por_id: string
  aprobado_por_id: string | null
  fecha_aprobacion: string | null  // ISO datetime
  creado_en: string
  actualizado_en: string
}

export interface RequisicionCreate {
  fecha_requerida?: string | null
  notas?: string | null
}

export interface RequisicionDetalleRead {
  id: string
  requisicion_id: string
  producto_id: string
  producto_nombre: string
  producto_codigo: string
  cantidad_solicitada: string      // Decimal as string
  cantidad_aprobada: string | null
  cantidad_surtida: string | null
  notas: string | null
}
