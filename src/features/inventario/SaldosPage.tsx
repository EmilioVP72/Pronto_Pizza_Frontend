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

import { toast } from 'sonner'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

const ParametrosActions = ({ row, user }: { row: any, user: any }) => {
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [pReorden, setPReorden] = useState("10");
  const [sMaximo, setSMaximo] = useState("50");

  const handleEditarParametros = async () => {
    const pr = parseFloat(pReorden);
    const sm = parseFloat(sMaximo);
    if (isNaN(pr) || isNaN(sm)) {
      toast.error("Valores inválidos");
      return;
    }

    try {
      setLoading(true);
      await api.patch('/inventario/parametros', {
        producto_id: row.original.producto_id,
        punto_reorden: pr,
        stock_maximo: sm
      });
      toast.success("Parámetros actualizados");
      setIsOpen(false);
    } catch (e) {
      console.error(e);
      toast.error("Error actualizando");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2 items-center">
      {['administrador', 'contador'].includes((user?.rol || '').toLowerCase()) && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings2 className="w-4 h-4 mr-1" /> Editar Parámetros
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Parámetros - {row.original.producto_nombre}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="reorden">Punto de Reorden</Label>
                <Input id="reorden" value={pReorden} onChange={(e) => setPReorden(e.target.value)} type="number" step="0.01" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="maximo">Stock Máximo</Label>
                <Input id="maximo" value={sMaximo} onChange={(e) => setSMaximo(e.target.value)} type="number" step="0.01" />
              </div>
              <Button onClick={handleEditarParametros} disabled={loading}>
                Guardar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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
