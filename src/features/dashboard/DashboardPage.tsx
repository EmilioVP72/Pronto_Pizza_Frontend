import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { ModuleCard } from '@/components/ui/ModuleCard'
import { Package, ShoppingCart, Truck, Factory, Calculator, Users, ClipboardList, Clock, DollarSign, ArrowUpRight } from 'lucide-react'
import { api } from '@/lib/axios'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface DashboardData {
  valor_inventario_por_sucursal: { sucursal: string; valor: number }[]
  sla_procesamiento: { sla_promedio_horas: number }
  rotacion_top_5: { producto: string; cantidad: number }[]
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const role = user?.rol || ''
  const [kpiData, setKpiData] = useState<DashboardData | null>(null)

  useEffect(() => {
    const fetchKpis = async () => {
      try {
        const res = await api.get('/kpis/dashboard')
        setKpiData(res.data)
      } catch (error) {
        console.error('Error fetching KPIs', error)
      }
    }
    if (['administrador', 'contador'].includes(role)) {
      fetchKpis()
    }
  }, [role])

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
  
  const totalValor = kpiData?.valor_inventario_por_sucursal.reduce((acc, curr) => acc + curr.valor, 0) || 0

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          ¡Hola, {user?.nombre_completo?.split(' ')[0] || 'Usuario'}!
        </h1>
        <p className="text-muted-foreground text-lg">
          Bienvenido a tu espacio de trabajo en <span className="font-medium text-primary">{user?.sucursal_nombre}</span>.
        </p>
      </div>

      {kpiData && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Valor Total del Inventario</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalValor.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <p className="text-xs text-muted-foreground mt-1">Activo en todas las sucursales</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">SLA de Procesamiento</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpiData.sla_procesamiento.sla_promedio_horas} hrs</div>
              <p className="text-xs text-muted-foreground mt-1">Tiempo promedio de requisiciones</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Top Salidas / Merma</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">
                {kpiData.rotacion_top_5.length > 0 ? (
                  <div className="space-y-1 mt-1">
                    {kpiData.rotacion_top_5.slice(0, 2).map((item, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span className="truncate max-w-[120px]">{item.producto}</span>
                        <span className="font-bold">{item.cantidad.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-2xl font-bold text-muted-foreground">-</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pt-4">
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
