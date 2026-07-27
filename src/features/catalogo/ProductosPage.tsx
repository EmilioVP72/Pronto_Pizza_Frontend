import { useState } from 'react'
import { Plus, Edit, Trash } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { useProductos, useEliminarProducto } from './useCatalogo'
import { useCategorias, useUnidadesMedida } from '@/features/shared/useCatalogos'
import type { ProductoRead } from './catalogo.types'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ProductoForm } from './ProductoForm'

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)


const getColumns = (
  onEdit: (producto: ProductoRead) => void,
  onDelete: (id: string) => void,
  categorias: any[],
  unidades: any[]
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
    accessorKey: 'categoria_id',
    header: 'Categoría',
    cell: ({ row }) => {
      const cat = categorias?.find(c => c.id === row.original.categoria_id)
      return cat ? cat.nombre : row.original.categoria_id
    },
  },
  {
    accessorKey: 'unidad_medida_id',
    header: 'Unidad',
    cell: ({ row }) => {
      const uni = unidades?.find(u => u.id === row.original.unidad_medida_id)
      return uni ? uni.abreviatura : row.original.unidad_medida_id
    },
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
    header: 'Acciones',
    cell: ({ row }) => {
      const producto = row.original
      return (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => onEdit(producto)}>
            <Edit className="h-4 w-4" />
          </Button>
          {producto.activo && (
            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => onDelete(producto.id)}>
              <Trash className="h-4 w-4" />
            </Button>
          )}
        </div>
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
  
  const { data: categorias } = useCategorias()
  const { data: unidades } = useUnidadesMedida()

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

  const columns = getColumns(handleEdit, handleDelete, categorias || [], unidades || [])

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
