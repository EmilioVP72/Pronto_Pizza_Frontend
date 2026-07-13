export interface SaldoInventarioRead {
  id: string
  sucursal_id: string
  producto_id: string
  producto_nombre: string
  producto_codigo: string
  cantidad: string // Decimal as string
  lote_id: string | null
  lote_codigo: string | null
}

export interface MovimientoInventarioRead {
  id: string
  tipo_movimiento_id: string
  tipo_movimiento_codigo: string
  cantidad: string
  producto_id: string
  producto_nombre: string
  sucursal_id: string
  creado_en: string
}

export interface ProductoBajoMinimoRead {
  producto_id: string
  producto_codigo: string
  producto_nombre: string
  cantidad_actual: string
  punto_reorden: string
}
