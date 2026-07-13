import { useState } from 'react'
import { Plus } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { useProductos } from './useCatalogo'
import type { ProductoRead } from './catalogo.types'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ProductoForm } from './ProductoForm'

const columns: ColumnDef<ProductoRead>[] = [
  {
    accessorKey: 'codigo',
    header: 'Código',
  },
  {
    accessorKey: 'nombre',
    header: 'Nombre',
  },
  {
    accessorKey: 'es_insumo',
    header: 'Insumo',
    cell: ({ row }) => (row.original.es_insumo ? 'Sí' : 'No'),
  },
  {
    accessorKey: 'es_preparado',
    header: 'Preparado',
    cell: ({ row }) => (row.original.es_preparado ? 'Sí' : 'No'),
  },
  {
    accessorKey: 'es_venta',
    header: 'Venta',
    cell: ({ row }) => (row.original.es_venta ? 'Sí' : 'No'),
  },
  {
    accessorKey: 'activo',
    header: 'Estatus',
    cell: ({ row }) => (
      <StatusBadge estatus={row.original.activo ? 'activo' : 'inactivo'} />
    ),
  },
]

export default function ProductosPage() {
  const [page, setPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { data, isLoading } = useProductos(page)

  return (
    <div>
      <PageHeader
        title="Catálogo de Productos"
        breadcrumbs={[
          { label: 'Catálogo' },
          { label: 'Productos' },
        ]}
        actions={
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Producto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Registrar Nuevo Producto</DialogTitle>
              </DialogHeader>
              <ProductoForm onSuccess={() => setIsModalOpen(false)} />
            </DialogContent>
          </Dialog>
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
