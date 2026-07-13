import { createBrowserRouter, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { AppShell } from '@/components/layout/AppShell'
import { LoginPage } from '@/features/auth/LoginPage'

// Catálogo
import ProductosPage from '@/features/catalogo/ProductosPage'

// Inventario
import SaldosPage from '@/features/inventario/SaldosPage'
import MovimientosPage from '@/features/inventario/MovimientosPage'
import ProductosBajoMinimoPage from '@/features/inventario/ProductosBajoMinimoPage'

// Requisiciones
import RequisicionesPage from '@/features/requisiciones/RequisicionesPage'
import RequisicionDetallePage from '@/features/requisiciones/RequisicionDetallePage'

// Despachos
import DespachosPage from '@/features/despachos/DespachosPage'
import DespachoDetallePage from '@/features/despachos/DespachoDetallePage'

// Producción
import OrdenesProduccionPage from '@/features/produccion/OrdenesProduccionPage'

// Contabilidad
import ExportacionesPage from '@/features/contabilidad/ExportacionesPage'

// Administración
import UsuariosPage from '@/features/usuarios/UsuariosPage'

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useAuthStore((s) => s.token)
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: <PrivateRoute><AppShell /></PrivateRoute>,
    children: [
      { index: true, element: <Navigate to="/inventario/saldos" replace /> },
      
      // Catálogo
      { path: 'catalogo/productos', element: <ProductosPage /> },
      
      // Inventario
      { path: 'inventario/saldos', element: <SaldosPage /> },
      { path: 'inventario/movimientos', element: <MovimientosPage /> },
      { path: 'inventario/bajo-minimo', element: <ProductosBajoMinimoPage /> },
      
      // Requisiciones
      { path: 'requisiciones', element: <RequisicionesPage /> },
      { path: 'requisiciones/:id', element: <RequisicionDetallePage /> },
      
      // Despachos
      { path: 'despachos', element: <DespachosPage /> },
      { path: 'despachos/:id', element: <DespachoDetallePage /> },
      
      // Producción
      { path: 'produccion', element: <OrdenesProduccionPage /> },
      
      // Contabilidad
      { path: 'contabilidad/exportaciones', element: <ExportacionesPage /> },

      // Administración
      { path: 'administracion/usuarios', element: <UsuariosPage /> },
    ],
  },
])
