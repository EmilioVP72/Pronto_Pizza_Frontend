import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Pizza } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
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
import { useAuthStore } from '@/stores/authStore'
import { api } from '@/lib/axios'

// Supabase client config (should use env vars)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dummy.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'dummy_key'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

const loginSchema = z.object({
  email: z.string().email('Ingresa un correo válido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

type LoginForm = z.infer<typeof loginSchema>

export const LoginPage = () => {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [error, setError] = useState<string | null>(null)
  
  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values: LoginForm) => {
    setError(null)
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })

      if (signInError) throw signInError
      if (!data.session) throw new Error('No se obtuvo sesión')

      const token = data.session.access_token
      
      // Get the user data from our backend using the token
      // Wait, standard approach: fetch the user profile from /auth/me or similar, 
      // but if we don't have it, we just decode or fetch from /api/v1/usuarios/me
      // The context says: backend verifies JWT, extracts sub, gets user.
      // So we call a generic endpoint or a "me" endpoint. Let's assume /api/v1/usuarios/me exists.
      
      const response = await api.get('/usuarios/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setAuth(response.data, token)
      navigate('/')
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40">
      <div className="max-w-md w-full p-8 bg-card rounded-xl shadow-lg border">
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center mb-4 shadow-md">
            <Pizza className="h-8 w-8 text-secondary" />
          </div>
          <h1 className="text-2xl font-bold text-center">Pronto Pizza WMS</h1>
          <p className="text-muted-foreground text-sm mt-1">Ingresa con tus credenciales</p>
        </div>

        {error && (
          <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-6">
            {error}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo electrónico</FormLabel>
                  <FormControl>
                    <Input placeholder="usuario@prontopizza.com" {...field} />
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
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Verificando...' : 'Entrar'}
            </Button>

            {/* Dev Login Bypass para ver funcionalidades rápidamente */}
            {import.meta.env.DEV && (
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t">
                <p className="text-xs text-center text-muted-foreground font-semibold">Bypass de Desarrollo (Sin contraseña)</p>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full border-primary text-primary hover:bg-primary/10"
                  onClick={() => {
                    setAuth({
                      id: '33333333-3333-3333-3333-333333333333',
                      nombre_completo: 'Admin Pronto Pizza',
                      email: 'admin@prontopizza.com',
                      sucursal_id: '22222222-2222-2222-2222-222222222222',
                      sucursal_nombre: 'Comisariato Matriz',
                      sucursal_codigo: 'MTZ',
                      rol: 'administrador'
                    }, 'dummy-dev-token')
                    navigate('/')
                  }}
                >
                  👑 Administrador
                </Button>

                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full border-blue-500 text-blue-500 hover:bg-blue-500/10"
                  onClick={() => {
                    setAuth({
                      id: '00000000-0000-0000-0000-000000000001',
                      nombre_completo: 'Encargado Norte',
                      email: 'encargado.norte@prontopizza.com',
                      sucursal_id: '00000000-0000-0000-0000-000000000002',
                      sucursal_nombre: 'Sucursal Norte',
                      sucursal_codigo: 'NOR',
                      rol: 'encargado_sucursal'
                    }, 'dummy-dev-token|encargado.norte@prontopizza.com')
                    navigate('/')
                  }}
                >
                  🏪 Encargado de Sucursal
                </Button>

                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full border-orange-500 text-orange-500 hover:bg-orange-500/10"
                  onClick={() => {
                    setAuth({
                      id: '00000000-0000-0000-0000-000000000002',
                      nombre_completo: 'Almacenista Central',
                      email: 'almacenista@prontopizza.com',
                      sucursal_id: '22222222-2222-2222-2222-222222222222',
                      sucursal_nombre: 'Comisariato Matriz',
                      sucursal_codigo: 'MTZ',
                      rol: 'almacenista'
                    }, 'dummy-dev-token|almacenista@prontopizza.com')
                    navigate('/')
                  }}
                >
                  📦 Almacenista
                </Button>

                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full border-green-500 text-green-500 hover:bg-green-500/10"
                  onClick={() => {
                    setAuth({
                      id: '00000000-0000-0000-0000-000000000003',
                      nombre_completo: 'Contador General',
                      email: 'contador@prontopizza.com',
                      sucursal_id: '22222222-2222-2222-2222-222222222222',
                      sucursal_nombre: 'Comisariato Matriz',
                      sucursal_codigo: 'MTZ',
                      rol: 'contador'
                    }, 'dummy-dev-token|contador@prontopizza.com')
                    navigate('/')
                  }}
                >
                  🧾 Contador
                </Button>
              </div>
            )}
          </form>
        </Form>
      </div>
    </div>
  )
}
