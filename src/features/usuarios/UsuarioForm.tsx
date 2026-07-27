import { useState } from 'react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCrearUsuario, useEditarUsuario } from './useUsuarios'
import type { UsuarioRead } from './usuarios.types'
import { useRoles, useSucursales } from '@/features/shared/useCatalogos'

const schema = (isEdit: boolean) => z.object({
  nombre_completo: z.string().min(3, 'Mínimo 3 caracteres'),
  email: z.string().email('Correo electrónico inválido'),
  password: isEdit ? z.string().optional() : z.string().min(6, 'Contraseña de mínimo 6 caracteres'),
  rol_id: z.coerce.number().min(1, 'Selecciona un rol'),
  sucursal_id: z.string().uuid('Selecciona una sucursal'),
})

type FormValues = z.infer<ReturnType<typeof schema>>

export const UsuarioForm = ({ onSuccess, usuario }: { onSuccess: () => void, usuario?: UsuarioRead }) => {
  const isEdit = !!usuario
  const { mutate: mutateCrear, isPending: isPendingCrear } = useCrearUsuario()
  const { mutate: mutateEditar, isPending: isPendingEditar } = useEditarUsuario(usuario?.id || '')
  
  const isPending = isPendingCrear || isPendingEditar
  const { data: roles, isLoading: loadingRoles } = useRoles()
  const { data: sucursales, isLoading: loadingSuc } = useSucursales()
  const [error, setError] = useState<string | null>(null)
  
  const form = useForm<FormValues>({ 
    resolver: zodResolver(schema(isEdit)),
    defaultValues: {
      nombre_completo: usuario?.nombre_completo || '',
      email: usuario?.email || '',
      password: '',
      rol_id: usuario?.rol_id || 0,
      sucursal_id: usuario?.sucursal_id || ''
    }
  })

  const onSubmit = (values: FormValues) => {
    setError(null)
    const mutate = isEdit ? mutateEditar : mutateCrear
    const payload = isEdit && !values.password ? { ...values, password: undefined } : values

    mutate(payload as any, { 
      onSuccess: () => {
        onSuccess()
      },
      onError: (err: any) => {
        const errorMsg = err.response?.data?.detail || err.message || `Error al ${isEdit ? 'actualizar' : 'crear'} el usuario`
        setError(errorMsg)
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        
        {error && (
          <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
            {error}
          </div>
        )}

        <FormField
          control={form.control}
          name="nombre_completo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre Completo</FormLabel>
              <FormControl>
                <Input placeholder="Ej. Juan Pérez" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo Electrónico</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="usuario@prontopizza.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{isEdit ? 'Nueva Contraseña (opcional)' : 'Contraseña Temporal'}</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="rol_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rol en el Sistema</FormLabel>
                <Select onValueChange={field.onChange} value={field.value ? field.value.toString() : undefined}>
                  <FormControl>
                    <SelectTrigger disabled={loadingRoles}>
                      <SelectValue placeholder="Seleccionar rol..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {roles?.map((r) => (
                      <SelectItem key={r.id} value={r.id.toString()}>{r.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sucursal_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sucursal de Asignación</FormLabel>
                <Select onValueChange={field.onChange} value={field.value ? field.value.toString() : undefined}>
                  <FormControl>
                    <SelectTrigger disabled={loadingSuc}>
                      <SelectValue placeholder="Seleccionar sucursal..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {sucursales?.map((s) => (
                      <SelectItem key={s.id} value={s.id.toString()}>{s.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Guardando...' : (isEdit ? 'Actualizar Usuario' : 'Crear Usuario')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
