import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/axios'
import type { UsuarioRead, UsuarioCreate, UsuarioUpdate } from './usuarios.types'
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
      const { data } = await api.get<PaginatedResponse<UsuarioRead>>('/organizacion/usuarios', {
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
      const { data } = await api.post<UsuarioRead>('/organizacion/usuarios', payload)
      return data
    },
    onSuccess: () => {
      toast.success('Usuario creado exitosamente')
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || err.message || 'Error al crear usuario')
    }
  })
}

export const useEditarUsuario = (id: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: UsuarioUpdate) => {
      const { data } = await api.patch<UsuarioRead>(`/organizacion/usuarios/${id}`, payload)
      return data
    },
    onSuccess: () => {
      toast.success('Usuario actualizado exitosamente')
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || err.message || 'Error al actualizar usuario')
    }
  })
}

export const useEliminarUsuario = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/organizacion/usuarios/${id}`)
    },
    onSuccess: () => {
      toast.success('Usuario eliminado exitosamente')
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || err.message || 'Error al eliminar usuario')
    }
  })
}
