import { Link, useLocation } from 'react-router-dom'
import { Package, ClipboardList, TrendingDown, Pizza, BookOpen, FileSpreadsheet, LayoutDashboard, LogOut, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePermissions } from '@/hooks/usePermissions'

const navItems = [
  { title: 'Requisiciones', href: '/requisiciones', icon: ClipboardList, roles: ['administrador', 'almacenista', 'encargado_sucursal'] },
  { title: 'Despachos', href: '/despachos', icon: Package, roles: ['administrador', 'almacenista'] },
  { title: 'Saldos', href: '/inventario/saldos', icon: LayoutDashboard, roles: ['administrador', 'almacenista', 'encargado_sucursal', 'solo_lectura'] },
  { title: 'Movimientos', href: '/inventario/movimientos', icon: TrendingDown, roles: ['administrador', 'almacenista', 'solo_lectura'] },
  { title: 'Bajo Mínimo', href: '/inventario/bajo-minimo', icon: TrendingDown, roles: ['administrador', 'almacenista'] },
  { title: 'Producción', href: '/produccion', icon: Pizza, roles: ['administrador', 'almacenista'] },
  { title: 'Productos', href: '/catalogo/productos', icon: BookOpen, roles: ['administrador'] },
  { title: 'Exportaciones', href: '/contabilidad/exportaciones', icon: FileSpreadsheet, roles: ['administrador', 'contador'] },
  { title: 'Usuarios', href: '/administracion/usuarios', icon: Users, roles: ['administrador'] },
]

export const Sidebar = () => {
  const location = useLocation()
  const { isReadOnly } = usePermissions() // We might need to check roles more specifically, or just rely on the roles array in navItems if we had the raw role.
  // For simplicity, let's just show all for now since we haven't implemented full role mapping in the items, 
  // actually wait, let's just render them all and we'll protect the routes later, or we can use the role if we get it from authStore.

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
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent',
                  isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
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
