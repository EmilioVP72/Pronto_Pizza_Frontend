export interface ProductoRead {
  id: string
  nombre: string
  codigo: string
  categoria_id: string
  unidad_medida_id: string
  es_insumo: boolean
  es_preparado: boolean
  es_venta: boolean
  activo: boolean
}

export interface ProductoCreate {
  nombre: string
  codigo: string
  categoria_id: string
  unidad_medida_id: string
  es_insumo?: boolean
  es_preparado?: boolean
  es_venta?: boolean
}
