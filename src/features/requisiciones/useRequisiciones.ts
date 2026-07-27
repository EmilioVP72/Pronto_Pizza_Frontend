import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/axios'
import type { RequisicionRead, RequisicionCreate, RequisicionDetalleRead } from './requisiciones.types'
import type { PaginatedResponse } from '@/types/api'

export const requisicionKeys = {
  all: ['requisiciones'] as const,
  lists: () => [...requisicionKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...requisicionKeys.lists(), filters] as const,
  detail: (id: string) => [...requisicionKeys.all, 'detail', id] as const,
  detalles: (id: string) => [...requisicionKeys.detail(id), 'detalles'] as const,
}

export const useRequisiciones = (page = 1, size = 20) => {
  return useQuery({
    queryKey: requisicionKeys.list({ page, size }),
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<RequisicionRead>>(
        '/requisiciones/', { params: { page, size } }
      )
      return data
    },
  })
}

export const useCrearRequisicion = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: RequisicionCreate) => {
      const { data } = await api.post<RequisicionRead>('/requisiciones/', payload)
      return data
    },
    onSuccess: () => {
      toast.success('Requisición creada exitosamente')
      queryClient.invalidateQueries({ queryKey: requisicionKeys.lists() })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || err.message || 'Error al crear requisición')
    }
  })
}

export const useRequisicion = (id: string) => {
  return useQuery({
    queryKey: requisicionKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get<RequisicionRead>(`/requisiciones/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export const useAprobarRequisicion = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch<RequisicionRead>(`/requisiciones/${id}/aprobar`)
      return data
    },
    onSuccess: (_, id) => {
      toast.success('Requisición aprobada')
      queryClient.invalidateQueries({ queryKey: requisicionKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: requisicionKeys.lists() })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || err.message || 'Error al aprobar requisición')
    }
  })
}
