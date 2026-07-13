import { useParams } from 'react-router-dom'
import { format } from 'date-fns'
import { CheckCircle, XCircle } from 'lucide-react'
import { useRequisicion, useAprobarRequisicion } from './useRequisiciones'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { usePermissions } from '@/hooks/usePermissions'
import { toast } from 'sonner'

export default function RequisicionDetallePage() {
  const { id } = useParams<{ id: string }>()
  const { data: requisicion, isLoading } = useRequisicion(id || '')
  const { mutate: aprobar, isPending: isAprobando } = useAprobarRequisicion()
  const { canApproveRequisicion } = usePermissions()

  if (isLoading) return <div>Cargando detalle...</div>
  if (!requisicion) return <div>No se encontró la requisición</div>

  const handleAprobar = () => {
    aprobar(requisicion.id, {
      onSuccess: () => toast.success('Requisición aprobada con éxito'),
      onError: (err: any) => toast.error(err.response?.data?.detail || 'Error al aprobar')
    })
  }

  return (
    <div>
      <PageHeader
        title={`Requisición ${requisicion.folio}`}
        breadcrumbs={[
          { label: 'Requisiciones', href: '/requisiciones' },
          { label: requisicion.folio },
        ]}
        actions={
          <>
            {canApproveRequisicion && requisicion.estatus === 'enviada' && (
              <>
                <Button variant="outline" className="text-destructive">
                  <XCircle className="mr-2 h-4 w-4" />
                  Rechazar
                </Button>
                <Button onClick={handleAprobar} disabled={isAprobando}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {isAprobando ? 'Aprobando...' : 'Aprobar'}
                </Button>
              </>
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
              <dd><StatusBadge estatus={requisicion.estatus} /></dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Fecha Solicitud</dt>
              <dd>{format(new Date(requisicion.creado_en), 'dd/MM/yyyy HH:mm')}</dd>
            </div>
            {requisicion.fecha_requerida && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Fecha Requerida</dt>
                <dd>{format(new Date(requisicion.fecha_requerida), 'dd/MM/yyyy')}</dd>
              </div>
            )}
          </dl>
        </div>
        
        <div className="bg-card border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Notas</h3>
          <p className="text-sm text-muted-foreground">
            {requisicion.notas || 'Sin notas adicionales.'}
          </p>
        </div>
      </div>

      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="p-4 border-b bg-muted/20">
          <h3 className="font-semibold">Líneas de Detalle</h3>
        </div>
        <div className="p-8 text-center text-muted-foreground">
          {/* Aquí iría la tabla de detalles, asumiendo un hook de useRequisicionDetalles */}
          Lista de productos solicitados
        </div>
      </div>
    </div>
  )
}
