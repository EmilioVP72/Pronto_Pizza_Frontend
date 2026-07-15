import { useState } from 'react'
import { Plus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { useProductos, useEliminarProducto } from './useCatalogo'
import type { ProductoRead } from './catalogo.types'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ProductoForm } from './ProductoForm'

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

const columns: ColumnDef<ProductoRead>[] = [
const getColumns = (
  onEdit: (producto: ProductoRead) => void,
  onDelete: (id: string) => void
): ColumnDef<ProductoRead>[] => [
  {
    accessorKey: 'codigo_interno',
    header: 'Código',
  },
  {
    accessorKey: 'nombre',
    header: 'Nombre',
  },
  {
    accessorKey: 'tipo_producto',
    header: 'Tipo',
    cell: ({ row }) => capitalize(row.original.tipo_producto),
  },
  {
    accessorKey: 'activo',
    header: 'Estatus',
    cell: ({ row }) => (
      <StatusBadge estatus={row.original.activo ? 'activo' : 'inactivo'} />
    ),
  },
  {
    id: 'acciones',
    cell: ({ row }) => {
      const producto = row.original
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEdit(producto)}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            {producto.activo && (
              <DropdownMenuItem onClick={() => onDelete(producto.id)} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Desactivar
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export default function ProductosPage() {
  const [page, setPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProducto, setEditingProducto] = useState<ProductoRead | null>(null)
  
  const { data, isLoading } = useProductos(page)
  const deleteMutation = useEliminarProducto()

  const handleEdit = (producto: ProductoRead) => {
    setEditingProducto(producto)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas desactivar este producto?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleOpenChange = (open: boolean) => {
    setIsModalOpen(open)
    if (!open) setEditingProducto(null)
  }

  const columns = getColumns(handleEdit, handleDelete)

  return (
    <div>
      <PageHeader
        title="Catálogo de Productos"
        breadcrumbs={[
          { label: 'Catálogo' },
          { label: 'Productos' },
        ]}
        actions={
          <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Producto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingProducto ? 'Editar Producto' : 'Registrar Nuevo Producto'}</DialogTitle>
              </DialogHeader>
              <ProductoForm 
                onSuccess={() => handleOpenChange(false)} 
                initialData={editingProducto} 
              />
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
