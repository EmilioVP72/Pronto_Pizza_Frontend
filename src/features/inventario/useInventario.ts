import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { SaldoInventarioRead, MovimientoInventarioRead, ProductoBajoMinimoRead } from './inventario.types'
import type { PaginatedResponse } from '@/types/api'

export const inventarioKeys = {
  saldos: ['saldos'] as const,
  saldosList: (filters: Record<string, unknown>) => [...inventarioKeys.saldos, 'list', filters] as const,
  movimientos: ['movimientos'] as const,
  movimientosList: (filters: Record<string, unknown>) => [...inventarioKeys.movimientos, 'list', filters] as const,
  bajoMinimo: ['bajo-minimo'] as const,
}

export const useSaldos = (page = 1, size = 20) => {
  return useQuery({
    queryKey: inventarioKeys.saldosList({ page, size }),
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<SaldoInventarioRead>>('/inventario/saldos', {
        params: { page, size },
      })
      return data
    },
  })
}

export const useMovimientos = (page = 1, size = 20) => {
  return useQuery({
    queryKey: inventarioKeys.movimientosList({ page, size }),
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<MovimientoInventarioRead>>('/inventario/movimientos', {
        params: { page, size },
      })
      return data
    },
  })
}

export const useBajoMinimo = (page = 1, size = 20) => {
  return useQuery({
    queryKey: inventarioKeys.bajoMinimo,
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<ProductoBajoMinimoRead>>('/inventario/productos-bajo-minimo', {
        params: { page, size },
      })
      return data
    },
  })
}
