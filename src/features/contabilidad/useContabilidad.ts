import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
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
      const { data } = await api.get<PaginatedResponse<ExportacionContpaqiRead>>('/contabilidad/exportaciones', {
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
      const { data } = await api.post<ExportacionContpaqiRead>('/contabilidad/exportar', payload)
      return data
    },
    onSuccess: () => {
      toast.success('Exportación a CONTPAQi generada')
      queryClient.invalidateQueries({ queryKey: contabilidadKeys.exportaciones })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || err.message || 'Error al generar la exportación')
    }
  })
}

export const downloadExportacion = async (id: string, filename: string) => {
  try {
    const response = await api.get(`/contabilidad/exportaciones/${id}/descargar`, {
      responseType: 'blob',
    })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename || `CONTPAQI_${id}.txt`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    toast.success('Descarga iniciada')
  } catch (error: any) {
    console.error('Error downloading the export:', error)
    toast.error('Error al descargar el archivo')
  }
}
