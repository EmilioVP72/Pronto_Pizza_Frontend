import { useState } from 'react'
import { FileSpreadsheet, Download } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { useExportaciones, useCrearExportacion } from './useContabilidad'
import type { ExportacionContpaqiRead } from './contabilidad.types'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { Button } from '@/components/ui/button'
import { usePermissions } from '@/hooks/usePermissions'

const columns: ColumnDef<ExportacionContpaqiRead>[] = [
  {
    accessorKey: 'creado_en',
    header: 'Fecha Generación',
    cell: ({ row }) => format(new Date(row.original.creado_en), 'dd/MM/yyyy HH:mm'),
  },
  {
    accessorKey: 'rango',
    header: 'Periodo',
    cell: ({ row }) => `${format(new Date(row.original.fecha_inicio), 'dd/MM/yyyy')} - ${format(new Date(row.original.fecha_fin), 'dd/MM/yyyy')}`,
  },
  {
    id: 'acciones',
    cell: ({ row }) => (
      <Button variant="ghost" size="sm" asChild>
        <a href={row.original.url_archivo || '#'} target="_blank" rel="noopener noreferrer">
          <Download className="h-4 w-4 mr-2" />
          Descargar TXT
        </a>
      </Button>
    ),
  },
]

export default function ExportacionesPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useExportaciones(page)
  const { canExportContpaqi } = usePermissions()

  return (
    <div>
      <PageHeader
        title="Exportaciones CONTPAQi"
        breadcrumbs={[{ label: 'Contabilidad' }, { label: 'Exportaciones' }]}
        actions={
          canExportContpaqi && (
            <Button>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Generar Exportación
            </Button>
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
