import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/lib/axios'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface BitacoraAccion {
  id: string
  usuario_id: string
  modulo: string
  accion: string
  detalles: string | null
  ip_address: string | null
  creado_en: string
  usuario: {
    nombre_completo: string
    rol: { nombre: string }
  }
}

interface PaginatedBitacora {
  items: BitacoraAccion[]
  total: number
  page: number
  pages: number
}

export default function BitacoraPage() {
  const [data, setData] = useState<PaginatedBitacora | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBitacora()
  }, [])

  const fetchBitacora = async () => {
    try {
      setLoading(true)
      const res = await api.get<PaginatedBitacora>('/bitacora?page=1&size=50')
      setData(res.data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Bitácora de Auditoría</h1>
        <p className="text-muted-foreground">Registro histórico de acciones del sistema.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Actividad</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Fecha</th>
                  <th className="px-4 py-3 font-medium">Usuario</th>
                  <th className="px-4 py-3 font-medium">Módulo</th>
                  <th className="px-4 py-3 font-medium">Acción</th>
                  <th className="px-4 py-3 font-medium">Detalles</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-muted-foreground">Cargando bitácora...</td>
                  </tr>
                ) : data?.items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-muted-foreground">No hay registros</td>
                  </tr>
                ) : (
                  data?.items.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        {format(new Date(log.creado_en), "dd MMM yyyy, HH:mm", { locale: es })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">{log.usuario.nombre_completo}</div>
                        <div className="text-xs text-muted-foreground">{log.usuario.rol.nombre}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                          {log.modulo}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium">{log.accion}</td>
                      <td className="px-4 py-3 text-xs font-mono text-muted-foreground max-w-xs truncate">
                        {log.detalles}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
