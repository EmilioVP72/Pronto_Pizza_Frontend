import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { ExportacionContpaqiRead, ExportarRequest } from './contabilidad.types'
import type { PaginatedResponse } from '@/types/api'

export const contabilidadKeys = {
  exportaciones: ['exportaciones'] as const,
  exportacionesList: (filters: Record<string, unknown>) => [...contabilidadKeys.exportaciones, 'list', filters] as const,
}

export const useExportaciones = (page = 1, size = 20) => {
  return useQuery({
    queryKey: contabilidadKeys.exportacionesList({ page, size }),
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<ExportacionContpaqiRead>>('/contpaqi/exportaciones', {
        params: { page, size },
      })
      return data
    },
  })
}

export const useCrearExportacion = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: ExportarRequest) => {
      const { data } = await api.post<ExportacionContpaqiRead>('/contpaqi/exportar', payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contabilidadKeys.exportaciones })
    },
  })
}
