import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { useDespachos } from './useDespachos'
import type { DespachoRead } from './despachos.types'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { usePermissions } from '@/hooks/usePermissions'
import { NuevoDespachoForm } from './NuevoDespachoForm'

import { useAuthStore } from '@/stores/authStore'
import { Printer, Send, Info } from 'lucide-react'
import { api } from '@/lib/axios'
import { toast } from 'sonner'

const DespachoActions = ({ despacho, onStatusChange }: { despacho: DespachoRead, onStatusChange: () => void }) => {
  const user = useAuthStore((s) => s.user)
  const [loading, setLoading] = useState(false)

  const handleCompletar = async () => {
    try {
      setLoading(true)
      await api.patch(`/despachos/${despacho.id}/completar`)
      onStatusChange()
      toast.success('Despacho completado con éxito')
    } catch (e: any) {
      console.error(e)
      toast.error(e.response?.data?.detail || 'Error al completar el despacho')
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    alert(`Imprimiendo ${despacho.tipo_documento} (Folio: ${despacho.folio})...`)
  }

  return (
    <div className="flex gap-2 items-center">
      <Link to={`/despachos/${despacho.id}`}>
        <Button variant="outline" size="sm"><Info className="w-4 h-4" /></Button>
      </Link>

      <Button variant="outline" size="sm" onClick={handlePrint}>
        <Printer className="w-4 h-4" />
      </Button>

      {['almacenista', 'administrador'].includes(user?.rol || '') && despacho.estatus === 'pendiente' && (
        <Button variant="default" size="sm" onClick={handleCompletar} disabled={loading}>
          <Send className="w-4 h-4 mr-1" /> Completar
        </Button>
      )}
    </div>
  )
}

const columns = (onStatusChange: () => void): ColumnDef<DespachoRead>[] => [
  {
    accessorKey: 'folio',
    header: 'Folio',
    cell: ({ row }) => (
      <Link to={`/despachos/${row.original.id}`} className="font-medium text-primary hover:underline">
        {row.original.folio}
      </Link>
    ),
  },
  {
    accessorKey: 'creado_en',
    header: 'Fecha',
    cell: ({ row }) => format(new Date(row.original.creado_en), 'dd/MM/yyyy HH:mm'),
  },
  {
    accessorKey: 'tipo_documento',
    header: 'Documento',
    cell: ({ row }) => row.original.tipo_documento || 'N/A',
  },
  {
    accessorKey: 'estatus',
    header: 'Estatus',
    cell: ({ row }) => <StatusBadge estatus={row.original.estatus} />,
  },
  {
    id: 'acciones',
    header: 'Acciones',
    cell: ({ row }) => <DespachoActions despacho={row.original} onStatusChange={onStatusChange} />
  }
]

export default function DespachosPage() {
  const [page, setPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { data, isLoading, refetch } = useDespachos(page)
  const { canDispatch } = usePermissions()

  return (
    <div>
      <PageHeader
        title="Despachos"
        breadcrumbs={[{ label: 'Despachos' }]}
        actions={
          canDispatch && (
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Despacho
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Registrar Nuevo Despacho</DialogTitle>
                </DialogHeader>
                <NuevoDespachoForm onSuccess={() => {
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
