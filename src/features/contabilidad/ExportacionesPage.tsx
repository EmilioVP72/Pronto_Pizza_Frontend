import { useState } from 'react'
import { FileSpreadsheet, Download, Loader2 } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { useExportaciones, useCrearExportacion, downloadExportacion } from './useContabilidad'
import type { ExportacionContpaqiRead } from './contabilidad.types'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { Button } from '@/components/ui/button'
import { usePermissions } from '@/hooks/usePermissions'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

const columns: ColumnDef<ExportacionContpaqiRead>[] = [
  {
    accessorKey: 'creado_en',
    header: 'Fecha Generación',
    cell: ({ row }) => format(new Date(row.original.creado_en), 'dd/MM/yyyy HH:mm'),
  },
  {
    accessorKey: 'rango',
    header: 'Periodo',
    cell: ({ row }) => `${format(new Date(row.original.periodo_inicio), 'dd/MM/yyyy')} - ${format(new Date(row.original.periodo_fin), 'dd/MM/yyyy')}`,
  },
  {
    accessorKey: 'total_registros',
    header: 'Registros',
    cell: ({ row }) => row.original.total_registros || 0,
  },
  {
    id: 'acciones',
    cell: ({ row }) => (
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => downloadExportacion(row.original.id, row.original.archivo_nombre || 'CONTPAQI.txt')}
      >
        <Download className="h-4 w-4 mr-2" />
        Descargar TXT
      </Button>
    ),
  },
]

export default function ExportacionesPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useExportaciones(page)
  const { canExportContpaqi } = usePermissions()
  const { mutate: crearExportacion, isPending } = useCrearExportacion()

  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({ periodo_inicio: '', periodo_fin: '', notas: '' })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    crearExportacion(formData, {
      onSuccess: () => {
        toast.success('Exportación generada correctamente')
        setOpen(false)
      },
      onError: () => {
        toast.error('Error al generar la exportación')
      }
    })
  }

  return (
    <div>
      <PageHeader
        title="Exportaciones CONTPAQi"
        breadcrumbs={[{ label: 'Contabilidad' }, { label: 'Exportaciones' }]}
        actions={
          canExportContpaqi && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Generar Exportación
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nueva Exportación CONTPAQi</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="inicio">Periodo Inicio</Label>
                    <Input 
                      id="inicio" 
                      type="date" 
                      required 
                      value={formData.periodo_inicio}
                      onChange={e => setFormData(p => ({ ...p, periodo_inicio: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fin">Periodo Fin</Label>
                    <Input 
                      id="fin" 
                      type="date" 
                      required 
                      value={formData.periodo_fin}
                      onChange={e => setFormData(p => ({ ...p, periodo_fin: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notas">Notas (Opcional)</Label>
                    <Input 
                      id="notas" 
                      value={formData.notas}
                      onChange={e => setFormData(p => ({ ...p, notas: e.target.value }))}
                    />
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={isPending}>
                      {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Generar
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )
        }
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
