import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { useSaldos } from './useInventario'
import type { SaldoInventarioRead } from './inventario.types'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { Button } from '@/components/ui/button'
import { Settings2 } from 'lucide-react'
import { api } from '@/lib/axios'
import { useAuthStore } from '@/stores/authStore'


const ParametrosActions = ({ row, user }: { row: any, user: any }) => {
  const [loading, setLoading] = useState(false);

  const handleEditarParametros = async () => {
    const pReordenStr = window.prompt(`Punto de Reorden para ${row.original.producto_nombre}:`, "10");
    if (!pReordenStr) return;
    const sMaxStr = window.prompt(`Stock Máximo para ${row.original.producto_nombre}:`, "50");
    if (!sMaxStr) return;

    try {
      setLoading(true);
      await api.patch('/inventario/parametros', {
        producto_id: row.original.producto_id,
        punto_reorden: parseFloat(pReordenStr),
        stock_maximo: parseFloat(sMaxStr)
      });
      alert("Parámetros actualizados");
    } catch (e) {
      console.error(e);
      alert("Error actualizando");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2 items-center">
      {['administrador', 'contador'].includes(user?.rol || '') && (
        <Button variant="outline" size="sm" onClick={handleEditarParametros} disabled={loading}>
          <Settings2 className="w-4 h-4 mr-1" /> Editar Parámetros
        </Button>
      )}
    </div>
  );
};

const columns = (user: any): ColumnDef<SaldoInventarioRead>[] => [
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
  {
    id: 'acciones',
    header: 'Acciones',
    cell: ({ row }) => <ParametrosActions row={row} user={user} />
  }
]

export default function SaldosPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useSaldos(page)
  const user = useAuthStore((s) => s.user)

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
        columns={columns(user)}
        data={data?.items || []}
        pageCount={data?.pages}
        pageIndex={page - 1}
        onPageChange={(p) => setPage(p + 1)}
        isLoading={isLoading}
      />
    </div>
  )
}
