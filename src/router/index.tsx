import { createBrowserRouter, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { AppShell } from '@/components/layout/AppShell'
import { LoginPage } from '@/features/auth/LoginPage'

// Catálogo
import DashboardPage from '@/features/dashboard/DashboardPage'
import { RoleGuard } from '@/components/layout/RoleGuard'
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
import BitacoraPage from '@/features/administracion/BitacoraPage'

// Gestión
import GestionDashboardPage from '@/features/gestion/GestionDashboardPage'
import SucursalesCrud from '@/features/gestion/SucursalesCrud'
import RolesCrud from '@/features/gestion/RolesCrud'

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
      { index: true, element: <DashboardPage /> },
      
      // Catálogo
      { 
        path: 'catalogo/productos', 
        element: <RoleGuard allowedRoles={['administrador']}><ProductosPage /></RoleGuard> 
      },
      
      // Inventario
      { 
        path: 'inventario/saldos', 
        element: <RoleGuard allowedRoles={['administrador', 'encargado_sucursal', 'almacenista', 'contador']}><SaldosPage /></RoleGuard> 
      },
      { 
        path: 'inventario/movimientos', 
        element: <RoleGuard allowedRoles={['administrador', 'almacenista', 'contador']}><MovimientosPage /></RoleGuard> 
      },
      { 
        path: 'inventario/bajo-minimo', 
        element: <RoleGuard allowedRoles={['administrador', 'encargado_sucursal', 'almacenista']}><ProductosBajoMinimoPage /></RoleGuard> 
      },
      
      // Requisiciones
      { 
        path: 'requisiciones', 
        element: <RoleGuard allowedRoles={['administrador', 'encargado_sucursal', 'almacenista']}><RequisicionesPage /></RoleGuard> 
      },
      { 
        path: 'requisiciones/:id', 
        element: <RoleGuard allowedRoles={['administrador', 'encargado_sucursal', 'almacenista']}><RequisicionDetallePage /></RoleGuard> 
      },
      
      // Despachos
      { 
        path: 'despachos', 
        element: <RoleGuard allowedRoles={['administrador', 'almacenista', 'contador']}><DespachosPage /></RoleGuard> 
      },
      { 
        path: 'despachos/:id', 
        element: <RoleGuard allowedRoles={['administrador', 'almacenista', 'contador']}><DespachoDetallePage /></RoleGuard> 
      },
      
      // Producción
      { 
        path: 'produccion', 
        element: <RoleGuard allowedRoles={['administrador', 'almacenista']}><OrdenesProduccionPage /></RoleGuard> 
      },
      
      // Contabilidad
      { 
        path: 'contabilidad/exportaciones', 
        element: <RoleGuard allowedRoles={['administrador', 'contador']}><ExportacionesPage /></RoleGuard> 
      },

      // Administración
      { 
        path: 'administracion/usuarios', 
        element: <RoleGuard allowedRoles={['administrador']}><UsuariosPage /></RoleGuard> 
      },
      { 
        path: 'administracion/bitacora', 
        element: <RoleGuard allowedRoles={['administrador']}><BitacoraPage /></RoleGuard> 
      },
      
      // Gestión
      { 
        path: 'gestion', 
        element: <RoleGuard allowedRoles={['administrador']}><GestionDashboardPage /></RoleGuard> 
      },
      { 
        path: 'gestion/sucursales', 
        element: <RoleGuard allowedRoles={['administrador']}><SucursalesCrud /></RoleGuard> 
      },
      { 
        path: 'gestion/roles', 
        element: <RoleGuard allowedRoles={['administrador']}><RolesCrud /></RoleGuard> 
      },
    ],
  },
])
