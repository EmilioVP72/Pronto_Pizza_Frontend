import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Trash, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useSucursales, useProductosBase } from '@/features/shared/useCatalogos'
import { toast } from 'sonner'
// Assuming we have a hook for useCrearDespacho which we might need to add to useDespachos.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { despachoKeys } from './useDespachos'

const schema = z.object({
  sucursal_destino_id: z.string().uuid('Seleccione una sucursal destino'),
  notas: z.string().max(500).optional().nullable(),
  detalles: z.array(
    z.object({
      producto_id: z.string().min(1, 'Seleccione un producto'),
      cantidad: z.coerce.number().min(0.0001, 'Debe ser mayor a 0')
    })
  ).min(1, 'Agrega al menos una partida')
})

type FormValues = z.infer<typeof schema>

// Helper hook
const useCrearDespacho = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: FormValues) => {
      const { data } = await api.post('/despachos/', payload)
      return data
    },
    onSuccess: () => {
      toast.success('Despacho generado exitosamente')
      queryClient.invalidateQueries({ queryKey: despachoKeys.lists() })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || err.message || 'Error al generar el despacho')
    }
  })
}

export const NuevoDespachoForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const { mutate, isPending } = useCrearDespacho()
  const { data: sucursales, isLoading: loadingSuc } = useSucursales()
  const { data: productos, isLoading: loadingProd } = useProductosBase()
  
  const form = useForm<FormValues>({ 
    resolver: zodResolver(schema),
    defaultValues: {
      detalles: [{ producto_id: '', cantidad: 1 }]
    }
  })

  const { fields, append, remove } = useFieldArray({
    name: 'detalles',
    control: form.control,
  })

  const onSubmit = (values: FormValues) => {
    mutate(values, { onSuccess })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="sucursal_destino_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sucursal Destino</FormLabel>
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
          <FormField
            control={form.control}
            name="notas"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notas Generales</FormLabel>
                <FormControl>
                  <Input placeholder="Observaciones..." {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="border rounded-md p-4 bg-muted/10">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium">Líneas de Despacho</h4>
            <Button type="button" variant="outline" size="sm" onClick={() => append({ producto_id: '', cantidad: 1 })}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Producto
            </Button>
          </div>
          
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-4">
                <FormField
                  control={form.control}
                  name={`detalles.${index}.producto_id`}
                  render={({ field: inputField }) => (
                    <FormItem className="flex-1">
                      <Select onValueChange={inputField.onChange} defaultValue={inputField.value}>
                        <FormControl>
                          <SelectTrigger disabled={loadingProd}>
                            <SelectValue placeholder="Seleccionar producto..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {productos?.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.codigo_interno} - {p.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name={`detalles.${index}.cantidad`}
                  render={({ field: inputField }) => (
                    <FormItem className="w-32">
                      <FormControl>
                        <Input type="number" step="0.01" min="0" placeholder="Cantidad" {...inputField} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="button" variant="ghost" size="icon" className="text-destructive mt-0.5"
                  onClick={() => remove(index)} disabled={fields.length === 1}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          {form.formState.errors.detalles?.root && (
             <p className="text-sm font-medium text-destructive mt-2">{form.formState.errors.detalles.root.message}</p>
          )}
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Enviando...' : 'Generar Despacho'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
