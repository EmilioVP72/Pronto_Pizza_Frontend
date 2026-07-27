import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { api } from '@/lib/axios'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'

interface Sucursal {
  id: string
  empresa_id: string
  nombre: string
  codigo: string
  direccion: string | null
  telefono: string | null
  es_comisariato: boolean
  activo: boolean
}

interface Empresa {
  id: string
  razon_social: string
}

const schema = z.object({
  empresa_id: z.string().min(1, 'La empresa es requerida'),
  nombre: z.string().min(2, 'Mínimo 2 caracteres'),
  codigo: z.string().min(2, 'Mínimo 2 caracteres'),
  direccion: z.string().optional(),
  telefono: z.string().optional(),
  es_comisariato: z.boolean().default(false),
})

type FormData = z.infer<typeof schema>

export default function SucursalesCrud() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const { data: sucursales, isLoading } = useQuery({
    queryKey: ['sucursales-crud'],
    queryFn: async () => {
      const { data } = await api.get<Sucursal[]>('/organizacion/sucursales')
      return data
    }
  })

  const { data: empresas } = useQuery({
    queryKey: ['empresas'],
    queryFn: async () => {
      const { data } = await api.get<Empresa[]>('/organizacion/empresas')
      return data
    }
  })

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { es_comisariato: false }
  })

  const createMutation = useMutation({
    mutationFn: (data: FormData) => api.post('/organizacion/sucursales', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sucursales-crud'] })
      queryClient.invalidateQueries({ queryKey: ['catalogos', 'sucursales'] })
      setIsModalOpen(false)
      toast.success('Sucursal creada exitosamente')
    },
    onError: (e: any) => toast.error(e.response?.data?.detail || 'Error al crear')
  })

  const updateMutation = useMutation({
    mutationFn: (data: { id: string, payload: FormData }) => api.patch(`/organizacion/sucursales/${data.id}`, data.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sucursales-crud'] })
      queryClient.invalidateQueries({ queryKey: ['catalogos', 'sucursales'] })
      setIsModalOpen(false)
      toast.success('Sucursal actualizada')
    },
    onError: (e: any) => toast.error(e.response?.data?.detail || 'Error al actualizar')
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/organizacion/sucursales/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sucursales-crud'] })
      queryClient.invalidateQueries({ queryKey: ['catalogos', 'sucursales'] })
      toast.success('Sucursal eliminada')
    },
    onError: (e: any) => toast.error(e.response?.data?.detail || 'Error al eliminar')
  })

  const onSubmit = (data: FormData) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, payload: data })
    } else {
      createMutation.mutate(data)
    }
  }

  const openEdit = (s: Sucursal) => {
    setEditingId(s.id)
    setValue('empresa_id', s.empresa_id)
    setValue('nombre', s.nombre)
    setValue('codigo', s.codigo)
    setValue('direccion', s.direccion || '')
    setValue('telefono', s.telefono || '')
    setValue('es_comisariato', s.es_comisariato)
    setIsModalOpen(true)
  }

  const openCreate = () => {
    setEditingId(null)
    reset({ es_comisariato: false, direccion: '', telefono: '' })
    if (empresas && empresas.length > 0) {
      setValue('empresa_id', empresas[0].id)
    }
    setIsModalOpen(true)
  }

  const columns: ColumnDef<Sucursal>[] = [
    { accessorKey: 'codigo', header: 'Código' },
    { accessorKey: 'nombre', header: 'Nombre' },
    { 
      accessorKey: 'es_comisariato', 
      header: 'Tipo',
      cell: ({ row }) => row.original.es_comisariato ? <span className="text-orange-600 font-semibold">Comisariato</span> : 'Sucursal'
    },
    {
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => openEdit(row.original)}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button variant="destructive" size="sm" onClick={() => {
            if(window.confirm('¿Eliminar sucursal?')) deleteMutation.mutate(row.original.id)
          }}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ]

  return (
    <div>
      <PageHeader
        title="Gestión de Sucursales"
        breadcrumbs={[
          { label: 'Gestión del Negocio', href: '/gestion' },
          { label: 'Sucursales' }
        ]}
        actions={
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" /> Añadir
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={sucursales || []}
        isLoading={isLoading}
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Sucursal' : 'Nueva Sucursal'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Empresa Perteneciente</Label>
              <Select value={watch('empresa_id')} onValueChange={(v) => setValue('empresa_id', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione empresa" />
                </SelectTrigger>
                <SelectContent>
                  {empresas?.map(e => (
                    <SelectItem key={e.id} value={e.id}>{e.razon_social}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.empresa_id && <p className="text-sm text-destructive">{errors.empresa_id.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Código Interno</Label>
                <Input {...register('codigo')} placeholder="Ej. SUC-01" />
                {errors.codigo && <p className="text-sm text-destructive">{errors.codigo.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input {...register('nombre')} placeholder="Ej. Plaza Real" />
                {errors.nombre && <p className="text-sm text-destructive">{errors.nombre.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Dirección</Label>
              <Input {...register('direccion')} />
            </div>

            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input {...register('telefono')} />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox 
                id="es_comisariato" 
                checked={watch('es_comisariato')} 
                onCheckedChange={(c) => setValue('es_comisariato', c === true)}
              />
              <Label htmlFor="es_comisariato">Es un Comisariato (Almacén Central)</Label>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                Guardar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
