import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { useDespachos } from './useDespachos'
import type { DespachoRead } from './despachos.types'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { usePermissions } from '@/hooks/usePermissions'
import { NuevoDespachoForm } from './NuevoDespachoForm'

const columns: ColumnDef<DespachoRead>[] = [
  {
    accessorKey: 'folio',
    header: 'Folio',
    cell: ({ row }) => (
      <Link to={`/despachos/${row.original.id}`} className="font-medium text-primary hover:underline">
        {row.original.folio}
      </Link>
    ),
  },
  {
    accessorKey: 'creado_en',
    header: 'Fecha',
    cell: ({ row }) => format(new Date(row.original.creado_en), 'dd/MM/yyyy HH:mm'),
  },
  {
    accessorKey: 'tipo_documento',
    header: 'Documento',
    cell: ({ row }) => row.original.tipo_documento || 'N/A',
  },
  {
    accessorKey: 'estatus',
    header: 'Estatus',
    cell: ({ row }) => <StatusBadge estatus={row.original.estatus} />,
  },
]

export default function DespachosPage() {
  const [page, setPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { data, isLoading } = useDespachos(page)
  const { canDispatch } = usePermissions()

  return (
    <div>
      <PageHeader
        title="Despachos"
        breadcrumbs={[{ label: 'Despachos' }]}
        actions={
          canDispatch && (
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Despacho
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Registrar Nuevo Despacho</DialogTitle>
                </DialogHeader>
                <NuevoDespachoForm onSuccess={() => setIsModalOpen(false)} />
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
