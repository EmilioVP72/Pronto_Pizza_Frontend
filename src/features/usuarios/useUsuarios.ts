import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { UsuarioRead, UsuarioCreate } from './usuarios.types'
import type { PaginatedResponse } from '@/types/api'

export const usuariosKeys = {
  all: ['usuarios'] as const,
  lists: () => [...usuariosKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...usuariosKeys.lists(), filters] as const,
}

export const useUsuarios = (page = 1, size = 20) => {
  return useQuery({
    queryKey: usuariosKeys.list({ page, size }),
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<UsuarioRead>>('/usuarios/', {
        params: { page, size },
      })
      return data
    },
  })
}

export const useCrearUsuario = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: UsuarioCreate) => {
      const { data } = await api.post<UsuarioRead>('/usuarios/', payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usuariosKeys.lists() })
    },
  })
}
