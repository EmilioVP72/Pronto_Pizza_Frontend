import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/shared/PageHeader'
import { Building2, PackageSearch, ShieldCheck, Users } from 'lucide-react'

export default function GestionDashboardPage() {
  const cards = [
    {
      title: 'Sucursales',
      description: 'Gestión de todas las sucursales y comisariatos',
      icon: Building2,
      href: '/gestion/sucursales',
      color: 'bg-blue-100 text-blue-700',
    },
    {
      title: 'Roles',
      description: 'Definición de roles de usuario y permisos del sistema',
      icon: ShieldCheck,
      href: '/gestion/roles',
      color: 'bg-indigo-100 text-indigo-700',
    },
    {
      title: 'Productos',
      description: 'Catálogo central de insumos y materia prima',
      icon: PackageSearch,
      href: '/catalogo/productos',
      color: 'bg-green-100 text-green-700',
    },
    {
      title: 'Usuarios',
      description: 'Cuentas de usuario y asignación a sucursales',
      icon: Users,
      href: '/administracion/usuarios',
      color: 'bg-orange-100 text-orange-700',
    }
  ]

  return (
    <div>
      <PageHeader
        title="Gestión de los negocios"
        breadcrumbs={[{ label: 'Gestión del Negocio' }]}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mt-6">
        {cards.map((card) => (
          <Link
            key={card.title}
            to={card.href}
            className="group block bg-card border rounded-xl p-6 transition-all hover:shadow-md hover:border-primary/50"
          >
            <div className="flex items-start gap-4">
              <div className={`p-4 rounded-lg ${card.color} group-hover:scale-105 transition-transform`}>
                <card.icon className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{card.title}</h3>
                <p className="text-muted-foreground">{card.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
