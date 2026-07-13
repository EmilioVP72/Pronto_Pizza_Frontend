import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { useMovimientos } from './useInventario'
import type { MovimientoInventarioRead } from './inventario.types'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'

const columns: ColumnDef<MovimientoInventarioRead>[] = [
  {
    accessorKey: 'creado_en',
    header: 'Fecha',
    cell: ({ row }) => format(new Date(row.original.creado_en), 'dd/MM/yyyy HH:mm'),
  },
  {
    accessorKey: 'producto_nombre',
    header: 'Producto',
  },
  {
    accessorKey: 'tipo_movimiento_codigo',
    header: 'Tipo',
    cell: ({ row }) => <StatusBadge estatus={row.original.tipo_movimiento_codigo} />,
  },
  {
    accessorKey: 'cantidad',
    header: 'Cantidad',
    cell: ({ row }) => {
      const cantidad = parseFloat(row.original.cantidad)
      const isPositive = cantidad > 0
      return (
        <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
          {isPositive ? '+' : ''}{cantidad.toLocaleString('es-MX', { maximumFractionDigits: 4 })}
        </span>
      )
    },
  },
]

export default function MovimientosPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useMovimientos(page)

  return (
    <div>
      <PageHeader
        title="Historial de Movimientos"
        breadcrumbs={[
          { label: 'Inventario' },
          { label: 'Movimientos' },
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
