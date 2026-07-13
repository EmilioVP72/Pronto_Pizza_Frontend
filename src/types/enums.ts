export const ESTATUS_REQUISICION = [
  'borrador', 'enviada', 'aprobada', 'surtida', 'cerrada', 'rechazada'
] as const
export type EstatusRequisicion = typeof ESTATUS_REQUISICION[number]

export const ESTATUS_DESPACHO = [
  'pendiente', 'en_proceso', 'completado', 'cancelado'
] as const
export type EstatusDespacho = typeof ESTATUS_DESPACHO[number]

export const ESTATUS_ORDEN_PRODUCCION = [
  'programada', 'en_proceso', 'completada', 'cancelada'
] as const
export type EstatusOrdenProduccion = typeof ESTATUS_ORDEN_PRODUCCION[number]

export const TIPO_DOCUMENTO = ['NOTA_TRASLADO', 'FACTURA', 'NOTA_VENTA'] as const
export type TipoDocumento = typeof TIPO_DOCUMENTO[number]

export const ROLES = [
  'administrador', 'almacenista', 'encargado_sucursal', 'contador', 'solo_lectura'
] as const
export type Rol = typeof ROLES[number]
