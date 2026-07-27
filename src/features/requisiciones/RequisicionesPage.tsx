import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { api } from '@/lib/axios'
import { useRequisiciones } from './useRequisiciones'
import type { RequisicionRead } from './requisiciones.types'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { usePermissions } from '@/hooks/usePermissions'
import { NuevaRequisicionForm } from './NuevaRequisicionForm'

import { useAuthStore } from '@/stores/authStore'
import { CheckCircle, Truck, PackageCheck, Ban, Printer, Send } from 'lucide-react'
import { toast } from 'sonner'

const RequisicionActions = ({ requisicion, onStatusChange }: { requisicion: RequisicionRead, onStatusChange: () => void }) => {
  const user = useAuthStore((s) => s.user)
  const [loading, setLoading] = useState(false)

  const handleAction = async (action: string) => {
    try {
      setLoading(true)
      await api.patch(`/requisiciones/${requisicion.id}/${action}`)
      onStatusChange()
      toast.success('Requisición actualizada con éxito')
    } catch (e: any) {
      console.error(e)
      toast.error(e.response?.data?.detail || 'Error al actualizar la requisición')
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/requisiciones/${requisicion.id}/pdf`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `Requisicion_${requisicion.folio || requisicion.id}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
    } catch (e) {
      console.error(e)
      toast.error('Error al generar PDF')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-2 items-center">
      <Link to={`/requisiciones/${requisicion.id}`}>
        <Button variant="outline" size="sm">Detalles</Button>
      </Link>
      
      <Button variant="outline" size="sm" onClick={handlePrint} disabled={loading}>
        <Printer className="w-4 h-4" />
      </Button>

      {/* Draft Actions */}
      {['encargado_sucursal', 'almacenista', 'administrador'].includes((user?.rol || '').toLowerCase()) && requisicion.estatus === 'borrador' && (
        <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => handleAction('enviar')} disabled={loading}>
          <Send className="w-4 h-4 mr-1" /> Enviar
        </Button>
      )}
      
      {/* Almacenista Actions */}
      {['almacenista', 'administrador'].includes((user?.rol || '').toLowerCase()) && requisicion.estatus === 'enviada' && (
        <Button variant="default" size="sm" onClick={() => handleAction('aprobar')} disabled={loading}>
          <CheckCircle className="w-4 h-4 mr-1" /> Aprobar
        </Button>
      )}
      
      {['almacenista', 'administrador'].includes((user?.rol || '').toLowerCase()) && requisicion.estatus === 'aprobada' && (
        <Button variant="secondary" size="sm" className="bg-orange-500 text-white hover:bg-orange-600" onClick={() => handleAction('surtir')} disabled={loading}>
          <Truck className="w-4 h-4 mr-1" /> Surtir
        </Button>
      )}

      {/* Encargado Actions */}
      {['encargado_sucursal', 'administrador'].includes((user?.rol || '').toLowerCase()) && requisicion.estatus === 'surtida' && (
        <Button variant="default" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleAction('cerrar')} disabled={loading}>
          <PackageCheck className="w-4 h-4 mr-1" /> Recibido
        </Button>
      )}
    </div>
  )
}

const columns = (onStatusChange: () => void): ColumnDef<RequisicionRead>[] => [
  {
    accessorKey: 'folio',
    header: 'Folio',
    cell: ({ row }) => (
      <Link to={`/requisiciones/${row.original.id}`} className="font-medium text-primary hover:underline">
        {row.original.folio}
      </Link>
    ),
  },
  {
    accessorKey: 'creado_en',
    header: 'Fecha Solicitud',
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
    cell: ({ row }) => <RequisicionActions requisicion={row.original} onStatusChange={onStatusChange} />
  }
]

export default function RequisicionesPage() {
  const [page, setPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { data, isLoading, refetch } = useRequisiciones(page)
  const { canCreateRequisicion } = usePermissions()

  return (
    <div>
      <PageHeader
        title="Requisiciones"
        breadcrumbs={[{ label: 'Requisiciones' }]}
        actions={
          canCreateRequisicion && (
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva Requisición
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Levantar Requisición</DialogTitle>
                </DialogHeader>
                <NuevaRequisicionForm onSuccess={() => {
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
