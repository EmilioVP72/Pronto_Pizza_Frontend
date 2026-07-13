import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCrearUsuario } from './useUsuarios'
import { useRoles, useSucursales } from '@/features/shared/useCatalogos'

const schema = z.object({
  nombre_completo: z.string().min(3, 'Mínimo 3 caracteres'),
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'Contraseña de mínimo 6 caracteres'),
  rol_id: z.coerce.number().min(1, 'Selecciona un rol'),
  sucursal_id: z.string().uuid('Selecciona una sucursal'),
})

type FormValues = z.infer<typeof schema>

export const UsuarioForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const { mutate, isPending } = useCrearUsuario()
  const { data: roles, isLoading: loadingRoles } = useRoles()
  const { data: sucursales, isLoading: loadingSuc } = useSucursales()
  
  const form = useForm<FormValues>({ 
    resolver: zodResolver(schema),
    defaultValues: {
      nombre_completo: '',
      email: '',
      password: '',
    }
  })

  const onSubmit = (values: FormValues) => {
    mutate(values, { onSuccess })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        
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
                <FormLabel>Contraseña Temporal</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
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
                <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
            {isPending ? 'Guardando...' : 'Crear Usuario'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
