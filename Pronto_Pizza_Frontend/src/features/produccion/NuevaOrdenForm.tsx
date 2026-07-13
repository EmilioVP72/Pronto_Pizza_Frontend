import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCrearOrdenProduccion } from './useProduccion'
import { useProductosBase } from '@/features/shared/useCatalogos'

const schema = z.object({
  receta_id: z.string().min(1, 'Selecciona una receta válida'),
  tandas: z.coerce.number().min(1, 'Debe ser al menos 1 tanda'),
  notas: z.string().max(500).optional().nullable(),
})

type FormValues = z.infer<typeof schema>

export const NuevaOrdenForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const { mutate, isPending } = useCrearOrdenProduccion()
  const { data: productos, isLoading: loadingRecetas } = useProductosBase() // Assumed to hold preparados/recetas
  const form = useForm<FormValues>({ 
    resolver: zodResolver(schema),
    defaultValues: { tandas: 1 }
  })

  const onSubmit = (values: FormValues) => {
    mutate(values, { onSuccess })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        
        <FormField
          control={form.control}
          name="receta_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preparado (Receta)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger disabled={loadingRecetas}>
                    <SelectValue placeholder="Seleccionar receta..." />
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
          name="tandas"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tandas a Producir</FormLabel>
              <FormControl>
                <Input type="number" min={1} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="notas"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas</FormLabel>
              <FormControl>
                <Input placeholder="Observaciones..." {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Programando...' : 'Programar Producción'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
