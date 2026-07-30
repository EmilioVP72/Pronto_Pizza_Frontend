import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCategorias, useUnidadesMedida } from '@/features/shared/useCatalogos'
import { useCrearProducto, useActualizarProducto } from './useCatalogo'
import type { ProductoRead } from './catalogo.types'

const schema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  codigo_interno: z.string().min(1, 'El código es requerido'),
  categoria_id: z.coerce.number().min(1, 'Selecciona una categoría'),
  unidad_medida_id: z.coerce.number().min(1, 'Selecciona una unidad'),
  tipo_producto: z.enum(['insumo', 'preparado', 'empaque', 'limpieza']),
  precio_referencia: z.coerce.number().optional().nullable(),
  clave_contpaqi: z.string().optional().nullable(),
})

type FormValues = z.infer<typeof schema>

interface ProductoFormProps {
  onSuccess: () => void
  initialData?: ProductoRead | null
}

export function ProductoForm({ onSuccess, initialData }: ProductoFormProps) {
  const { data: categorias, isLoading: loadingCat } = useCategorias()
  const { data: unidades, isLoading: loadingUni } = useUnidadesMedida()
  
  const createMutation = useCrearProducto()
  const updateMutation = useActualizarProducto()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: initialData?.nombre || '',
      codigo_interno: initialData?.codigo_interno || '',
      categoria_id: initialData?.categoria_id || 0,
      unidad_medida_id: initialData?.unidad_medida_id || 0,
      tipo_producto: (initialData?.tipo_producto as any) || 'insumo',
      precio_referencia: initialData?.precio_referencia ?? 0,
      clave_contpaqi: initialData?.clave_contpaqi || '',
    },
  })

  const onSubmit = (values: FormValues) => {
    if (initialData) {
      updateMutation.mutate({ id: initialData.id, data: values }, {
        onSuccess: () => onSuccess()
      })
    } else {
      createMutation.mutate(values, {
        onSuccess: () => onSuccess()
      })
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="codigo_interno"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código Interno</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. IN-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. Harina de Trigo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="categoria_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoría</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                  <FormControl>
                    <SelectTrigger disabled={loadingCat}>
                      <SelectValue placeholder="Selecciona..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categorias?.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="unidad_medida_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unidad de Medida</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                  <FormControl>
                    <SelectTrigger disabled={loadingUni}>
                      <SelectValue placeholder="Selecciona..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {unidades?.map((u) => (
                      <SelectItem key={u.id} value={u.id.toString()}>{u.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <FormField
            control={form.control}
            name="tipo_producto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Producto</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="insumo">Insumo</SelectItem>
                    <SelectItem value="preparado">Preparado / Terminado</SelectItem>
                    <SelectItem value="empaque">Empaque</SelectItem>
                    <SelectItem value="limpieza">Limpieza</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="precio_referencia"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio / Costo ($)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="Ej. 150.00" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="clave_contpaqi"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cuenta CONTPAQi</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. 1150-001-000" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end pt-4 gap-2">
          <Button type="button" variant="outline" onClick={onSuccess}>Cancelar</Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Guardando...' : (initialData ? 'Actualizar' : 'Guardar')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
