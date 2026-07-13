import { useState } from 'react'
import { Plus } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { useOrdenesProduccion } from './useProduccion'
import type { OrdenProduccionRead } from './produccion.types'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { usePermissions } from '@/hooks/usePermissions'
import { NuevaOrdenForm } from './NuevaOrdenForm'

const columns: ColumnDef<OrdenProduccionRead>[] = [
  {
    accessorKey: 'folio',
    header: 'Folio',
    cell: ({ row }) => <span className="font-medium text-primary">{row.original.folio}</span>,
  },
  {
    accessorKey: 'receta_nombre',
    header: 'Receta',
  },
  {
    accessorKey: 'tandas',
    header: 'Tandas',
  },
  {
    accessorKey: 'creado_en',
    header: 'Fecha',
    cell: ({ row }) => format(new Date(row.original.creado_en), 'dd/MM/yyyy HH:mm'),
  },
  {
    accessorKey: 'estatus',
    header: 'Estatus',
    cell: ({ row }) => <StatusBadge estatus={row.original.estatus} />,
  },
]

export default function OrdenesProduccionPage() {
  const [page, setPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { data, isLoading } = useOrdenesProduccion(page)
  // Check if user is in Matriz/Comisariato and has permissions, handled loosely for now
  const canCreate = true 

  return (
    <div>
      <PageHeader
        title="Órdenes de Producción"
        breadcrumbs={[{ label: 'Producción' }]}
        actions={
          canCreate && (
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva Orden
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl">
                <DialogHeader>
                  <DialogTitle>Programar Orden de Producción</DialogTitle>
                </DialogHeader>
                <NuevaOrdenForm onSuccess={() => setIsModalOpen(false)} />
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
