import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

// Tipos básicos para selects
export interface SelectOption {
  id: string | number
  nombre: string
}

export const catalogosKeys = {
  all: ['catalogos'] as const,
  roles: () => [...catalogosKeys.all, 'roles'] as const,
  sucursales: () => [...catalogosKeys.all, 'sucursales'] as const,
  categorias: () => [...catalogosKeys.all, 'categorias'] as const,
  unidades: () => [...catalogosKeys.all, 'unidades'] as const,
  productosBase: () => [...catalogosKeys.all, 'productos-base'] as const,
}

// Hooks
export const useRoles = () => {
  return useQuery({
    queryKey: catalogosKeys.roles(),
    queryFn: async () => {
      const { data } = await api.get<SelectOption[]>('/organizacion/roles')
      return data
    },
  })
}

export const useSucursales = () => {
  return useQuery({
    queryKey: catalogosKeys.sucursales(),
    queryFn: async () => {
      const { data } = await api.get<SelectOption[]>('/organizacion/sucursales')
      return data
    },
  })
}

export const useCategorias = () => {
  return useQuery({
    queryKey: catalogosKeys.categorias(),
    queryFn: async () => {
      const { data } = await api.get<SelectOption[]>('/productos/categorias')
      return data
    },
  })
}

export const useUnidadesMedida = () => {
  return useQuery({
    queryKey: catalogosKeys.unidades(),
    queryFn: async () => {
      const { data } = await api.get<SelectOption[]>('/productos/unidades')
      return data
    },
  })
}

export const useProductosBase = () => {
  return useQuery({
    queryKey: catalogosKeys.productosBase(),
    queryFn: async () => {
      const { data } = await api.get<{id: string, nombre: string, codigo_interno: string}[]>('/productos/base')
      return data
    },
  })
}
