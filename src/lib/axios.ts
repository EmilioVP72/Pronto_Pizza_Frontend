import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

// Interceptor: inyecta el JWT en cada request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Interceptor: manejo global de 401 y adaptación de paginación
api.interceptors.response.use(
  (response) => {
    const url = response.config.url || ''
    const isArrayExpected = 
      url.includes('/productos/categorias') || 
      url.includes('/productos/unidades') || 
      url.includes('/productos/base') || 
      url.includes('/organizacion/roles') || 
      url.includes('/organizacion/sucursales')

    // Si el backend regresa un arreglo plano pero el frontend espera PaginatedResponse
    if (Array.isArray(response.data) && !isArrayExpected) {
      response.data = {
        items: response.data,
        total: response.data.length,
        page: 1,
        size: response.data.length || 20,
        pages: 1
      }
    }
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
    }
    return Promise.reject(error)
  }
)
