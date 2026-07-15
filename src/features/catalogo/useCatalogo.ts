import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { ProductoRead, ProductoCreate } from './catalogo.types'
import type { PaginatedResponse } from '@/types/api'

export const catalogoKeys = {
  all: ['productos'] as const,
  lists: () => [...catalogoKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...catalogoKeys.lists(), filters] as const,
}

export const useProductos = (page = 1, size = 20) => {
  return useQuery({
    queryKey: catalogoKeys.list({ page, size }),
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<ProductoRead>>('/productos/', {
        params: { page, size },
      })
      return data
    },
  })
}

export const useCrearProducto = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: ProductoCreate) => {
      const res = await api.post<ProductoRead>('/productos/', data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catalogoKeys.lists() })
    },
  })
}

export const useActualizarProducto = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ProductoCreate> }) => {
      const res = await api.patch<ProductoRead>(`/productos/${id}`, data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catalogoKeys.lists() })
    },
  })
}

export const useEliminarProducto = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/productos/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catalogoKeys.lists() })
    },
  })
}
