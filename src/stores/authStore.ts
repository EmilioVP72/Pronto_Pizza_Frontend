import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Rol } from '@/types/enums'

export interface AuthUser {
  id: string
  nombre_completo: string
  email: string
  sucursal_id: string
  sucursal_nombre: string
  sucursal_codigo: string
  rol: Rol
}

interface AuthStore {
  user: AuthUser | null
  token: string | null
  setAuth: (user: AuthUser, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
    }),
    { name: 'wms-auth' }
  )
)
