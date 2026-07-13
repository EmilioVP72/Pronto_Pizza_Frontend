import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { useSaldos } from './useInventario'
import type { SaldoInventarioRead } from './inventario.types'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'

const columns: ColumnDef<SaldoInventarioRead>[] = [
  {
    accessorKey: 'producto_codigo',
    header: 'Código Producto',
  },
  {
    accessorKey: 'producto_nombre',
    header: 'Nombre Producto',
  },
  {
    accessorKey: 'cantidad',
    header: 'Cantidad',
    cell: ({ row }) => {
      // Backend returns Decimal as string. Parse it for display
      const cantidad = parseFloat(row.original.cantidad)
      return cantidad.toLocaleString('es-MX', { maximumFractionDigits: 4 })
    },
  },
  {
    accessorKey: 'lote_codigo',
    header: 'Lote',
    cell: ({ row }) => row.original.lote_codigo || 'N/A',
  },
]

export default function SaldosPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useSaldos(page)

  return (
    <div>
      <PageHeader
        title="Saldos de Inventario"
        breadcrumbs={[
          { label: 'Inventario' },
          { label: 'Saldos' },
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
