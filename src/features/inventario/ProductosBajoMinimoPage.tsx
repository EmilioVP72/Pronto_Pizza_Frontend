import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { useBajoMinimo } from './useInventario'
import type { ProductoBajoMinimoRead } from './inventario.types'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import { api } from '@/lib/axios'

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
  {
    id: 'acciones',
    header: 'Acciones',
    cell: ({ row }) => {
      const navigate = useNavigate();
      
      const max = parseFloat(row.original.stock_maximo || '0')
      const actual = parseFloat(row.original.cantidad_actual || '0')
      const sugerido = max > actual ? max - actual : 0
      
      const handleSolicitar = async () => {
        try {
          // In a real app we'd open a modal or create it directly.
          // For now, let's create it directly
          await api.post('/requisiciones/', {
            fecha_requerida: new Date(Date.now() + 86400000).toISOString(),
            notas: "Requisición generada automáticamente desde reporte Bajo Mínimo",
            detalles: [{
              producto_id: row.original.producto_id,
              cantidad_solicitada: sugerido,
              notas: "Sugerencia por stock bajo"
            }]
          })
          navigate('/requisiciones')
        } catch (e) {
          console.error(e)
        }
      }

      return (
        <Button variant="outline" size="sm" onClick={handleSolicitar} disabled={sugerido <= 0}>
          <ShoppingCart className="w-4 h-4 mr-1" /> Solicitar Automático ({sugerido})
        </Button>
      )
    }
  }
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
