import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
      const { data } = await api.get<PaginatedResponse<OrdenProduccionRead>>('/ordenes-produccion/', {
        params: { page, size },
      })
      return data
    },
  })
}

export const useCrearOrdenProduccion = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: OrdenProduccionCreate) => {
      const { data } = await api.post<OrdenProduccionRead>('/ordenes-produccion/', payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: produccionKeys.lists() })
    },
  })
}
