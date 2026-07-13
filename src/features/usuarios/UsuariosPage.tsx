import { useState } from 'react'
import { Plus, Users } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { useUsuarios } from './useUsuarios'
import type { UsuarioRead } from './usuarios.types'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { UsuarioForm } from './UsuarioForm'
import { usePermissions } from '@/hooks/usePermissions'

const columns: ColumnDef<UsuarioRead>[] = [
  {
    accessorKey: 'nombre_completo',
    header: 'Nombre',
    cell: ({ row }) => <span className="font-medium text-primary">{row.original.nombre_completo}</span>,
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'sucursal_nombre',
    header: 'Sucursal',
  },
  {
    accessorKey: 'rol_nombre',
    header: 'Rol',
    cell: ({ row }) => <StatusBadge estatus={row.original.rol_nombre || 'N/A'} />,
  },
  {
    accessorKey: 'activo',
    header: 'Estatus',
    cell: ({ row }) => <StatusBadge estatus={row.original.activo ? 'activo' : 'inactivo'} />,
  },
]

export default function UsuariosPage() {
  const [page, setPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { data, isLoading } = useUsuarios(page)
  // Assumes only admin can access this page
  const canManage = true

  return (
    <div>
      <PageHeader
        title="Gestión de Usuarios"
        breadcrumbs={[{ label: 'Administración' }, { label: 'Usuarios' }]}
        actions={
          canManage && (
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Usuario
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl">
                <DialogHeader>
                  <DialogTitle>Registrar Nuevo Usuario</DialogTitle>
                </DialogHeader>
                <UsuarioForm onSuccess={() => setIsModalOpen(false)} />
              </DialogContent>
            </Dialog>
          )
        }
      />
      <DataTable
        columns={columns}
        data={data?.items || []}
        pageCount={data?.pages}
        pageIndex={page - 1}
        onPageChange={(p) => setPage(p + 1)}
        isLoading={isLoading}
      />
    </div>
  )
}
