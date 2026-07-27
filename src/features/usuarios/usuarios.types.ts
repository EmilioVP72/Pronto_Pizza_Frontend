export interface UsuarioRead {
  id: string
  nombre_completo: string
  email: string
  sucursal_id: string
  sucursal?: { nombre: string }
  rol_id: number
  rol?: { nombre: string }
  activo: boolean
  creado_en: string
}

export interface UsuarioCreate {
  nombre_completo: string
  email: string
  password?: string
  rol_id: number
  sucursal_id: string
}

export interface UsuarioUpdate extends Partial<UsuarioCreate> {}
