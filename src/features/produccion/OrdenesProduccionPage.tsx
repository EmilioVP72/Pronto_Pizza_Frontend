import { useState } from 'react'
import { Plus } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { useOrdenesProduccion } from './useProduccion'
import type { OrdenProduccionRead } from './produccion.types'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { usePermissions } from '@/hooks/usePermissions'
import { NuevaOrdenForm } from './NuevaOrdenForm'

import { useAuthStore } from '@/stores/authStore'
import { Printer, CheckCircle, Info } from 'lucide-react'
import { api } from '@/lib/axios'
import { toast } from 'sonner'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const ProduccionActions = ({ orden, onStatusChange }: { orden: OrdenProduccionRead, onStatusChange: () => void }) => {
  const user = useAuthStore((s) => s.user)
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [cantidad, setCantidad] = useState("1")

  const handleCompletar = async () => {
    const cantidad_real = parseFloat(cantidad)
    if (isNaN(cantidad_real) || cantidad_real <= 0) {
      toast.error("Cantidad inválida")
      return
    }

    try {
      setLoading(true)
      await api.patch(`/produccion/ordenes/${orden.id}/completar`, {
        cantidad_real,
        notas: "Completado vía UI"
      })
      onStatusChange()
      toast.success('Orden de producción finalizada con éxito')
      setIsOpen(false)
    } catch (e: any) {
      console.error(e)
      toast.error(e.response?.data?.detail || 'Error al finalizar la orden')
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    toast.info(`Imprimiendo Etiqueta para Lote: ${orden.folio}...`)
  }

  return (
    <div className="flex gap-2 items-center">
      {['almacenista', 'administrador'].includes(user?.rol || '') && orden.estatus === 'programada' && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="default" size="sm" disabled={loading}>
              <CheckCircle className="w-4 h-4 mr-1" /> Finalizar Lote
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Finalizar Lote - {orden.folio}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="cantidad">Cantidad Real Producida</Label>
                <Input id="cantidad" value={cantidad} onChange={(e) => setCantidad(e.target.value)} type="number" step="0.01" />
              </div>
              <Button onClick={handleCompletar} disabled={loading}>
                Confirmar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {orden.estatus === 'completada' && (
        <Button variant="outline" size="sm" onClick={handlePrint} disabled={loading}>
          <Printer className="w-4 h-4 mr-1" /> Imprimir Etiqueta
        </Button>
      )}
    </div>
  )
}

const columns = (onStatusChange: () => void): ColumnDef<OrdenProduccionRead>[] => [
  {
    accessorKey: 'folio',
    header: 'Folio',
    cell: ({ row }) => <span className="font-medium text-primary">{row.original.folio}</span>,
  },
  {
    accessorKey: 'receta_nombre',
    header: 'Receta',
  },
  {
    accessorKey: 'tandas',
    header: 'Tandas',
  },
  {
    accessorKey: 'creado_en',
    header: 'Fecha',
    cell: ({ row }) => format(new Date(row.original.creado_en), 'dd/MM/yyyy HH:mm'),
  },
  {
    accessorKey: 'estatus',
    header: 'Estatus',
    cell: ({ row }) => <StatusBadge estatus={row.original.estatus} />,
  },
  {
    id: 'acciones',
    header: 'Acciones',
    cell: ({ row }) => <ProduccionActions orden={row.original} onStatusChange={onStatusChange} />
  }
]

export default function OrdenesProduccionPage() {
  const [page, setPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { data, isLoading, refetch } = useOrdenesProduccion(page)
  // Check if user is in Matriz/Comisariato and has permissions, handled loosely for now
  const canCreate = true 

  return (
    <div>
      <PageHeader
        title="Órdenes de Producción"
        breadcrumbs={[{ label: 'Producción' }]}
        actions={
          canCreate && (
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva Orden
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl">
                <DialogHeader>
                  <DialogTitle>Programar Orden de Producción</DialogTitle>
                </DialogHeader>
                <NuevaOrdenForm onSuccess={() => {
                  setIsModalOpen(false)
                  refetch()
                }} />
              </DialogContent>
            </Dialog>
          )
        }
      />
      <DataTable
        columns={columns(() => refetch())}
        data={data?.items || []}
        pageCount={data?.pages}
        pageIndex={page - 1}
        onPageChange={(p) => setPage(p + 1)}
        isLoading={isLoading}
      />
    </div>
  )
}
