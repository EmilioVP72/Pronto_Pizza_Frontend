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

import { toast } from 'sonner'

interface Rol {
  id: number
  nombre: string
  descripcion: string | null
}

const schema = z.object({
  nombre: z.string().min(2, 'Mínimo 2 caracteres'),
  descripcion: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const CORE_ROLES = ['administrador', 'encargado_sucursal', 'almacenista']

export default function RolesCrud() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRol, setEditingRol] = useState<Rol | null>(null)

  const { data: roles, isLoading } = useQuery({
    queryKey: ['roles-crud'],
    queryFn: async () => {
      const { data } = await api.get<Rol[]>('/organizacion/roles')
      return data
    }
  })

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const createMutation = useMutation({
    mutationFn: (data: FormData) => api.post('/organizacion/roles', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles-crud'] })
      queryClient.invalidateQueries({ queryKey: ['catalogos', 'roles'] })
      setIsModalOpen(false)
      toast.success('Rol creado exitosamente')
    },
    onError: (e: any) => toast.error(e.response?.data?.detail || 'Error al crear')
  })

  const updateMutation = useMutation({
    mutationFn: (data: { id: number, payload: FormData }) => api.patch(`/organizacion/roles/${data.id}`, data.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles-crud'] })
      queryClient.invalidateQueries({ queryKey: ['catalogos', 'roles'] })
      setIsModalOpen(false)
      toast.success('Rol actualizado')
    },
    onError: (e: any) => toast.error(e.response?.data?.detail || 'Error al actualizar')
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/organizacion/roles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles-crud'] })
      queryClient.invalidateQueries({ queryKey: ['catalogos', 'roles'] })
      toast.success('Rol eliminado')
    },
    onError: (e: any) => toast.error(e.response?.data?.detail || 'Error al eliminar')
  })

  const onSubmit = (data: FormData) => {
    if (editingRol) {
      updateMutation.mutate({ id: editingRol.id, payload: data })
    } else {
      createMutation.mutate(data)
    }
  }

  const openEdit = (r: Rol) => {
    setEditingRol(r)
    setValue('nombre', r.nombre)
    setValue('descripcion', r.descripcion || '')
    setIsModalOpen(true)
  }

  const openCreate = () => {
    setEditingRol(null)
    reset({ nombre: '', descripcion: '' })
    setIsModalOpen(true)
  }

  const columns: ColumnDef<Rol>[] = [
    { 
      accessorKey: 'nombre', 
      header: 'Nombre del Rol',
      cell: ({ row }) => (
        <span className="font-semibold">{row.original.nombre}</span>
      )
    },
    { 
      accessorKey: 'descripcion', 
      header: 'Descripción / Permisos' 
    },
    {
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => {
        const isCore = CORE_ROLES.includes(row.original.nombre)
        return (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => openEdit(row.original)}>
              <Pencil className="w-4 h-4" />
            </Button>
            {!isCore && (
              <Button variant="destructive" size="sm" onClick={() => {
                if(window.confirm('¿Eliminar rol?')) deleteMutation.mutate(row.original.id)
              }}>
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        )
      }
    }
  ]

  const isCoreEditing = editingRol ? CORE_ROLES.includes(editingRol.nombre) : false

  return (
    <div>
      <PageHeader
        title="Gestión de Roles"
        breadcrumbs={[
          { label: 'Gestión del Negocio', href: '/gestion' },
          { label: 'Roles' }
        ]}
        actions={
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" /> Añadir Rol
          </Button>
        }
      />

      <div className="mb-4 text-sm text-muted-foreground p-4 bg-muted rounded-md border border-l-4 border-l-blue-500">
        <strong>Nota:</strong> Los roles <code>administrador</code>, <code>encargado_sucursal</code> y <code>almacenista</code> son vitales para el funcionamiento del sistema. No pueden ser eliminados ni cambiados de nombre, pero sí puedes enriquecer su descripción.
      </div>

      <DataTable
        columns={columns}
        data={roles || []}
        isLoading={isLoading}
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRol ? 'Editar Rol' : 'Nuevo Rol'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Identificador del Rol</Label>
              <Input 
                {...register('nombre')} 
                disabled={isCoreEditing} 
                className={isCoreEditing ? 'bg-muted cursor-not-allowed' : ''}
              />
              {errors.nombre && <p className="text-sm text-destructive">{errors.nombre.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Descripción / Qué puede hacer</Label>
              <textarea 
                {...register('descripcion')} 
                rows={4} 
                placeholder="Ej. Acceso total a todos los módulos y configuraciones del sistema." 
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              />
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
