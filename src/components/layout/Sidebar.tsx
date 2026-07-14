import { Link, useLocation } from 'react-router-dom'
import { Package, ClipboardList, TrendingDown, Pizza, BookOpen, FileSpreadsheet, LayoutDashboard, LogOut, Users, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'

const navItems = [
  { title: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['administrador', 'almacenista', 'encargado_sucursal', 'contador'] },
  { title: 'Requisiciones', href: '/requisiciones', icon: ClipboardList, roles: ['administrador', 'almacenista', 'encargado_sucursal'] },
  { title: 'Despachos', href: '/despachos', icon: Package, roles: ['administrador', 'almacenista', 'contador'] },
  { title: 'Saldos', href: '/inventario/saldos', icon: Package, roles: ['administrador', 'almacenista', 'encargado_sucursal', 'contador'] },
  { title: 'Movimientos', href: '/inventario/movimientos', icon: TrendingDown, roles: ['administrador', 'almacenista', 'contador'] },
  { title: 'Bajo Mínimo', href: '/inventario/bajo-minimo', icon: AlertTriangle, roles: ['administrador', 'almacenista', 'encargado_sucursal'] },
  { title: 'Producción', href: '/produccion', icon: Pizza, roles: ['administrador', 'almacenista'] },
  { title: 'Productos', href: '/catalogo/productos', icon: BookOpen, roles: ['administrador'] },
  { title: 'Exportaciones', href: '/contabilidad/exportaciones', icon: FileSpreadsheet, roles: ['administrador', 'contador'] },
  { title: 'Usuarios', href: '/administracion/usuarios', icon: Users, roles: ['administrador'] },
  { title: 'Bitácora', href: '/administracion/bitacora', icon: ClipboardList, roles: ['administrador'] },
]

export const Sidebar = () => {
  const location = useLocation()
  const user = useAuthStore((s) => s.user)
  const role = user?.rol || ''
  
  const visibleNavItems = navItems.filter(item => item.roles.includes(role))

  return (
    <aside className="w-64 border-r bg-card flex flex-col h-full">
      <div className="h-16 flex items-center px-6 border-b">
        <div className="flex items-center gap-2 font-bold text-xl text-primary">
          <Pizza className="h-6 w-6 text-secondary" />
          Pronto Pizza
        </div>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid gap-1 px-4">
          {visibleNavItems.map((item) => {
            // Check exact match for dashboard, else startsWith for active state
            const isActive = item.href === '/' 
                ? location.pathname === '/' 
                : location.pathname.startsWith(item.href)
                
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-primary/10 hover:text-primary',
                  isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            )
          })}
        </nav>
      </div>
      <div className="p-4 border-t">
        <div className="text-xs text-muted-foreground text-center">
          WMS Frontend v1.0
        </div>
      </div>
    </aside>
  )
}
