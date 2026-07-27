import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/axios'
import type { OrdenProduccionRead, OrdenProduccionCreate } from './produccion.types'
import type { PaginatedResponse } from '@/types/api'

export const produccionKeys = {
  all: ['ordenes-produccion'] as const,
  lists: () => [...produccionKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...produccionKeys.lists(), filters] as const,
  detail: (id: string) => [...produccionKeys.all, 'detail', id] as const,
}

export const useOrdenesProduccion = (page = 1, size = 20) => {
  return useQuery({
    queryKey: produccionKeys.list({ page, size }),
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<OrdenProduccionRead>>('/produccion/ordenes', {
        params: { page, size: 20 },
      })
      return data
    },
  })
}

export const useCrearOrdenProduccion = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: OrdenProduccionCreate) => {
      const { data } = await api.post<OrdenProduccionRead>('/produccion/ordenes', payload)
      return data
    },
    onSuccess: () => {
      toast.success('Orden de producción generada con éxito')
      queryClient.invalidateQueries({ queryKey: produccionKeys.lists() })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || err.message || 'Error al generar la orden')
    }
  })
}
