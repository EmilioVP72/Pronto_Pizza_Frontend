import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { useBajoMinimo } from './useInventario'
import type { ProductoBajoMinimoRead } from './inventario.types'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'

const columns: ColumnDef<ProductoBajoMinimoRead>[] = [
  {
    accessorKey: 'producto_codigo',
    header: 'Código',
  },
  {
    accessorKey: 'producto_nombre',
    header: 'Producto',
  },
  {
    accessorKey: 'punto_reorden',
    header: 'Punto de Reorden',
    cell: ({ row }) => parseFloat(row.original.punto_reorden).toLocaleString('es-MX'),
  },
  {
    accessorKey: 'cantidad_actual',
    header: 'Cantidad Actual',
    cell: ({ row }) => (
      <span className="text-destructive font-bold">
        {parseFloat(row.original.cantidad_actual).toLocaleString('es-MX')}
      </span>
    ),
  },
]

export default function ProductosBajoMinimoPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useBajoMinimo(page)

  return (
    <div>
      <PageHeader
        title="Productos Bajo Mínimo"
        breadcrumbs={[
          { label: 'Inventario' },
          { label: 'Bajo Mínimo' },
        ]}
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
