import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const ESTATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline', colorClass?: string }> = {
  borrador:    { label: 'Borrador',   variant: 'secondary' },
  enviada:     { label: 'Enviada',    variant: 'default', colorClass: 'bg-blue-500 hover:bg-blue-600' },
  aprobada:    { label: 'Aprobada',   variant: 'default', colorClass: 'bg-green-500 hover:bg-green-600' },
  surtida:     { label: 'Surtida',    variant: 'default' },
  cerrada:     { label: 'Cerrada',    variant: 'outline' },
  rechazada:   { label: 'Rechazada',  variant: 'destructive' },
  pendiente:   { label: 'Pendiente',  variant: 'secondary' },
  en_proceso:  { label: 'En proceso', variant: 'default', colorClass: 'bg-yellow-500 hover:bg-yellow-600 text-black' },
  completado:  { label: 'Completado', variant: 'outline' },
  cancelado:   { label: 'Cancelado',  variant: 'destructive' },
  programada:  { label: 'Programada', variant: 'secondary' },
  completada:  { label: 'Completada', variant: 'outline' },
  cancelada:   { label: 'Cancelada',  variant: 'destructive' },
}

export const StatusBadge = ({ estatus, className }: { estatus: string; className?: string }) => {
  const config = ESTATUS_CONFIG[estatus] || { label: estatus, variant: 'default' }

  return (
    <Badge variant={config.variant} className={cn(config.colorClass, className)}>
      {config.label}
    </Badge>
  )
}
