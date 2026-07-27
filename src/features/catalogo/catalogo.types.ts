export interface ProductoRead {
  id: string
  nombre: string
  codigo_interno: string
  tipo_producto: string
  categoria_id: number
  unidad_medida_id: number
  activo: boolean
}

export interface ProductoCreate {
  nombre: string
  codigo_interno: string
  tipo_producto: string
  categoria_id: number
  unidad_medida_id: number
}
