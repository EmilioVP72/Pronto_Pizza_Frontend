import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/axios'
import type { DespachoRead, DespachoCreate } from './despachos.types'
import type { PaginatedResponse } from '@/types/api'

export const despachoKeys = {
  all: ['despachos'] as const,
  lists: () => [...despachoKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...despachoKeys.lists(), filters] as const,
  detail: (id: string) => [...despachoKeys.all, 'detail', id] as const,
}

export const useDespachos = (page = 1, size = 20) => {
  return useQuery({
    queryKey: despachoKeys.list({ page, size }),
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<DespachoRead>>('/despachos/', {
        params: { page, size },
      })
      return data
    },
  })
}

export const useDespacho = (id: string) => {
  return useQuery({
    queryKey: despachoKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get<DespachoRead>(`/despachos/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export const useCompletarDespacho = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch<DespachoRead>(`/despachos/${id}/completar`)
      return data
    },
    onSuccess: (_, id) => {
      toast.success('Despacho completado')
      queryClient.invalidateQueries({ queryKey: despachoKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: despachoKeys.lists() })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || err.message || 'Error al completar el despacho')
    }
  })
}
