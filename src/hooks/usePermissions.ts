import { useAuthStore } from '@/stores/authStore'

export const usePermissions = () => {
  const rol = useAuthStore((s) => s.user?.rol)?.toLowerCase()

  return {
    canCreateRequisicion: ['administrador', 'almacenista', 'encargado_sucursal'].includes(rol ?? ''),
    canApproveRequisicion: ['administrador', 'almacenista'].includes(rol ?? ''),
    canDispatch: ['administrador', 'almacenista'].includes(rol ?? ''),
    canManageCatalog: ['administrador'].includes(rol ?? ''),
    canExportContpaqi: ['administrador', 'contador'].includes(rol ?? ''),
    isReadOnly: rol === 'solo_lectura',
  }
}
