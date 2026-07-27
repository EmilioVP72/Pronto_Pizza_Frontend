import { useParams } from 'react-router-dom'
import { format } from 'date-fns'
import { Truck } from 'lucide-react'
import { useDespacho, useCompletarDespacho } from './useDespachos'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { usePermissions } from '@/hooks/usePermissions'
import { toast } from 'sonner'

export default function DespachoDetallePage() {
  const { id } = useParams<{ id: string }>()
  const { data: despacho, isLoading } = useDespacho(id || '')
  const { mutate: completar, isPending: isCompletando } = useCompletarDespacho()
  const { canDispatch } = usePermissions()

  if (isLoading) return <div>Cargando detalle...</div>
  if (!despacho) return <div>No se encontró el despacho</div>

  const handleCompletar = () => {
    completar(despacho.id, {
      onSuccess: () => toast.success('Despacho completado con éxito'),
      onError: (err: any) => toast.error(err.response?.data?.detail || 'Error al completar')
    })
  }

  return (
    <div>
      <PageHeader
        title={`Despacho ${despacho.folio_documento}`}
        breadcrumbs={[
          { label: 'Despachos', href: '/despachos' },
          { label: despacho.folio_documento || 'Detalle' },
        ]}
        actions={
          <>
            {canDispatch && despacho.estatus === 'en_proceso' && (
              <Button onClick={handleCompletar} disabled={isCompletando}>
                <Truck className="mr-2 h-4 w-4" />
                {isCompletando ? 'Completando...' : 'Completar Despacho'}
              </Button>
            )}
          </>
        }
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-card border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Información General</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Estatus</dt>
              <dd><StatusBadge estatus={despacho.estatus} /></dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Fecha Creación</dt>
              <dd>{format(new Date(despacho.creado_en), 'dd/MM/yyyy HH:mm')}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Tipo de Documento</dt>
              <dd>{despacho.tipo_documento || 'No asignado'}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="p-4 border-b bg-muted/20">
          <h3 className="font-semibold">Líneas de Despacho</h3>
        </div>
        <div className="p-8 text-center text-muted-foreground">
          Lista de productos a despachar
        </div>
      </div>
    </div>
  )
}
