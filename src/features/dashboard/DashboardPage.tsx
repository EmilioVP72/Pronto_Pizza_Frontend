import { useAuthStore } from '@/stores/authStore'
import { ModuleCard } from '@/components/ui/ModuleCard'
import { Package, ShoppingCart, Truck, Factory, Calculator, Users, ClipboardList } from 'lucide-react'

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const role = user?.rol || ''

  const allModules = [
    {
      id: 'requisiciones',
      title: 'Requisiciones',
      description: 'Crea, revisa y aprueba solicitudes de insumos.',
      icon: ShoppingCart,
      href: '/requisiciones',
      colorClass: 'text-rose-500 bg-rose-500/10 group-hover:bg-rose-500',
      allowedRoles: ['administrador', 'encargado_sucursal', 'almacenista'],
    },
    {
      id: 'despachos',
      title: 'Despachos',
      description: 'Genera notas de traslado y facturas para envíos.',
      icon: Truck,
      href: '/despachos',
      colorClass: 'text-amber-500 bg-amber-500/10 group-hover:bg-amber-500',
      allowedRoles: ['administrador', 'almacenista', 'contador'],
    },
    {
      id: 'inventario',
      title: 'Inventario',
      description: 'Consulta saldos, movimientos y productos bajo mínimo.',
      icon: Package,
      href: '/inventario/saldos',
      colorClass: 'text-blue-500 bg-blue-500/10 group-hover:bg-blue-500',
      allowedRoles: ['administrador', 'encargado_sucursal', 'almacenista', 'contador'],
    },
    {
      id: 'produccion',
      title: 'Producción',
      description: 'Gestiona órdenes de producción y recetas.',
      icon: Factory,
      href: '/produccion',
      colorClass: 'text-indigo-500 bg-indigo-500/10 group-hover:bg-indigo-500',
      allowedRoles: ['administrador', 'almacenista'],
    },
    {
      id: 'contabilidad',
      title: 'Contabilidad',
      description: 'Genera exportaciones de pólizas para CONTPAQi.',
      icon: Calculator,
      href: '/contabilidad/exportaciones',
      colorClass: 'text-emerald-500 bg-emerald-500/10 group-hover:bg-emerald-500',
      allowedRoles: ['administrador', 'contador'],
    },
    {
      id: 'administracion',
      title: 'Administración',
      description: 'Gestiona usuarios, roles y accesos.',
      icon: Users,
      href: '/administracion/usuarios',
      colorClass: 'text-slate-500 bg-slate-500/10 group-hover:bg-slate-500',
      allowedRoles: ['administrador'],
    },
    {
      id: 'bitacora',
      title: 'Bitácora de Auditoría',
      description: 'Supervisa todas las acciones y movimientos en el sistema.',
      icon: ClipboardList,
      href: '/administracion/bitacora',
      colorClass: 'text-violet-500 bg-violet-500/10 group-hover:bg-violet-500',
      allowedRoles: ['administrador'],
    },
  ]

  const visibleModules = allModules.filter(m => m.allowedRoles.includes(role))

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          ¡Hola, {user?.nombre_completo.split(' ')[0]}!
        </h1>
        <p className="text-muted-foreground text-lg">
          Bienvenido a tu espacio de trabajo en <span className="font-medium text-primary">{user?.sucursal_nombre}</span>.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visibleModules.map((module) => (
          <ModuleCard
            key={module.id}
            title={module.title}
            description={module.description}
            icon={module.icon}
            href={module.href}
            colorClass={module.colorClass}
          />
        ))}
      </div>
    </div>
  )
}
