import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { ProductoRead } from './catalogo.types'
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
