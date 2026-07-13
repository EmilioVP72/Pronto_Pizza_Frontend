# AGENTS.md — WMS Pronto Pizza · Frontend

> Este archivo es la fuente de verdad para cualquier agente de IA que trabaje en este repositorio.
> Léelo completo antes de tocar cualquier archivo. No asumas nada que no esté aquí.

---

## 1. Descripción del Proyecto

Interfaz web del Sistema de Gestión de Almacén (WMS) para **Pronto Pizza**. Es una SPA que
consume el API REST del backend (`wms-backend`). Los usuarios son internos: almacenistas,
encargados de sucursal, administradores y contadores.

**Este repo es exclusivamente el frontend.** El backend vive en `wms-backend`.

### Sucursales del negocio
| Código | Nombre |
|---|---|
| MTZ | Matriz / Comisariato (bodega central) |
| HER | Héroes |
| PLZ | Plaza Real |
| CAL | Calzada |
| SLR | San Luis Rey |

---

## 2. Stack Técnico

| Capa | Tecnología | Versión mínima |
|---|---|---|
| Framework | React | 19 |
| Build tool | Vite | 6+ |
| Lenguaje | TypeScript | 5.4+ |
| Estilos | Tailwind CSS | 3.4+ |
| Componentes UI | shadcn/ui | latest |
| Estado servidor | TanStack Query (react-query) | v5 |
| Estado cliente | Zustand | 4+ |
| Routing | React Router | v7 |
| Formularios | React Hook Form + Zod | — |
| Auth | Supabase Auth JS | v2 |
| HTTP client | Axios | 1.7+ |
| Tablas | TanStack Table | v8 |
| Fechas | date-fns | v3 |
| Iconos | Lucide React | — |

**No usar:** Redux, MobX, Context API para estado global, fetch nativo (usar Axios), moment.js,
react-datepicker (usar el Date Picker de shadcn), cualquier librería de componentes que no sea
shadcn/ui salvo que esté listada aquí.

---

## 3. Estructura de Carpetas

```
wms-frontend/
├── public/
├── src/
│   ├── main.tsx                    # Entrypoint
│   ├── App.tsx                     # Rutas raíz, providers globales
│   ├── assets/                     # Logos, imágenes estáticas
│   ├── components/
│   │   ├── ui/                     # Componentes shadcn/ui (NO editar manualmente)
│   │   ├── layout/
│   │   │   ├── AppShell.tsx        # Shell principal: sidebar + header + outlet
│   │   │   ├── Sidebar.tsx
│   │   │   └── Header.tsx
│   │   └── shared/                 # Componentes reutilizables propios
│   │       ├── DataTable.tsx       # Wrapper de TanStack Table con paginación
│   │       ├── PageHeader.tsx      # Título de página + breadcrumb + acciones
│   │       ├── StatusBadge.tsx     # Badge de estatus con colores por estado
│   │       ├── ConfirmDialog.tsx   # Modal de confirmación genérico
│   │       └── LoadingSpinner.tsx
│   ├── features/                   # Un directorio por módulo funcional
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   └── useAuth.ts
│   │   ├── requisiciones/
│   │   │   ├── RequisicionesPage.tsx
│   │   │   ├── RequisicionDetallePage.tsx
│   │   │   ├── NuevaRequisicionForm.tsx
│   │   │   ├── useRequisiciones.ts      # TanStack Query hooks
│   │   │   └── requisiciones.types.ts   # Tipos TS del módulo
│   │   ├── despachos/
│   │   │   ├── DespachosPage.tsx
│   │   │   ├── DespachoDetallePage.tsx
│   │   │   ├── useDespachos.ts
│   │   │   └── despachos.types.ts
│   │   ├── inventario/
│   │   │   ├── SaldosPage.tsx
│   │   │   ├── MovimientosPage.tsx
│   │   │   ├── ProductosBajoMinimoPage.tsx
│   │   │   ├── useInventario.ts
│   │   │   └── inventario.types.ts
│   │   ├── produccion/
│   │   │   ├── OrdenesProduccionPage.tsx
│   │   │   ├── NuevaOrdenForm.tsx
│   │   │   ├── useProduccion.ts
│   │   │   └── produccion.types.ts
│   │   ├── catalogo/
│   │   │   ├── ProductosPage.tsx
│   │   │   ├── ProductoForm.tsx
│   │   │   ├── useCatalogo.ts
│   │   │   └── catalogo.types.ts
│   │   └── contabilidad/
│   │       ├── ExportacionesPage.tsx
│   │       ├── useContabilidad.ts
│   │       └── contabilidad.types.ts
│   ├── lib/
│   │   ├── axios.ts                # Instancia de Axios configurada con baseURL e interceptors
│   │   ├── queryClient.ts          # Instancia de QueryClient con defaults
│   │   └── utils.ts                # cn() de shadcn y helpers generales
│   ├── stores/
│   │   └── authStore.ts            # Zustand: usuario activo, sucursal, rol
│   ├── hooks/
│   │   └── usePermissions.ts       # Hook: canApprove(), canDispatch(), etc.
│   ├── types/
│   │   └── api.ts                  # Tipos globales: PaginatedResponse<T>, ApiError
│   └── router/
│       └── index.tsx               # Definición de rutas y guards
├── .env.example
├── .env.local                      # ← NUNCA commitear
├── index.html
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
├── components.json                 # Config de shadcn/ui
└── AGENTS.md                       # Este archivo
```

---

## 4. Convenciones de Código

### 4.1 TypeScript estricto

`tsconfig.json` tiene `"strict": true`. No usar `any`. Si el tipo no se conoce, usar `unknown`
y narrowing. No usar `// @ts-ignore` ni `// @ts-nocheck`.

```typescript
// CORRECTO
const handleError = (error: unknown) => {
  if (error instanceof AxiosError) {
    toast.error(error.response?.data?.detail ?? 'Error desconocido')
  }
}

// INCORRECTO
const handleError = (error: any) => { ... }  // ❌
```

### 4.2 Nombrado

- Archivos de componentes: `PascalCase.tsx` (`RequisicionesPage.tsx`)
- Archivos de hooks, utils, tipos: `camelCase.ts` (`useRequisiciones.ts`)
- Componentes: `PascalCase`
- Hooks: `useXxx`
- Tipos e interfaces: `PascalCase` con sufijo descriptivo (`RequisicionRead`, `DespachoCreate`)
- Constantes: `UPPER_SNAKE_CASE`
- Variables y funciones: `camelCase`

### 4.3 Componentes: solo functional components con hooks

```typescript
// CORRECTO
const RequisicionCard = ({ requisicion }: { requisicion: RequisicionRead }) => {
  return <div>...</div>
}

export default RequisicionCard

// INCORRECTO
class RequisicionCard extends React.Component { ... }  // ❌
```

### 4.4 Exportaciones

- Páginas y componentes de features: `export default`
- Componentes compartidos y hooks: `export` nombrado

---

## 5. Tipos TypeScript — Contrato con el Backend

Estos tipos reflejan los schemas Pydantic del backend. Si el backend cambia un schema,
actualizar el tipo correspondiente aquí.

### Tipos globales (`src/types/api.ts`)

```typescript
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  size: number
  pages: number
}

export interface ApiError {
  detail: string
}
```

### Enums de estatus

```typescript
// src/types/enums.ts

export const ESTATUS_REQUISICION = [
  'borrador', 'enviada', 'aprobada', 'surtida', 'cerrada', 'rechazada'
] as const
export type EstatusRequisicion = typeof ESTATUS_REQUISICION[number]

export const ESTATUS_DESPACHO = [
  'pendiente', 'en_proceso', 'completado', 'cancelado'
] as const
export type EstatusDespacho = typeof ESTATUS_DESPACHO[number]

export const ESTATUS_ORDEN_PRODUCCION = [
  'programada', 'en_proceso', 'completada', 'cancelada'
] as const
export type EstatusOrdenProduccion = typeof ESTATUS_ORDEN_PRODUCCION[number]

export const TIPO_DOCUMENTO = ['NOTA_TRASLADO', 'FACTURA', 'NOTA_VENTA'] as const
export type TipoDocumento = typeof TIPO_DOCUMENTO[number]

export const ROLES = [
  'administrador', 'almacenista', 'encargado_sucursal', 'contador', 'solo_lectura'
] as const
export type Rol = typeof ROLES[number]
```

### Tipos principales por módulo

```typescript
// src/features/requisiciones/requisiciones.types.ts

export interface RequisicionRead {
  id: string
  sucursal_id: string
  folio: string
  estatus: EstatusRequisicion
  fecha_requerida: string | null   // ISO date
  notas: string | null
  creado_por_id: string
  aprobado_por_id: string | null
  fecha_aprobacion: string | null  // ISO datetime
  creado_en: string
  actualizado_en: string
}

export interface RequisicionCreate {
  fecha_requerida?: string | null
  notas?: string | null
}

export interface RequisicionDetalleRead {
  id: string
  requisicion_id: string
  producto_id: string
  cantidad_solicitada: string      // Decimal como string desde el backend
  cantidad_aprobada: string | null
  cantidad_surtida: string | null
  notas: string | null
}
```

> **Nota sobre decimales:** El backend devuelve `Decimal` serializado como `string` para evitar
> pérdida de precisión. Siempre mostrar con `parseFloat()` para display, pero nunca recalcular
> con aritmética JS. Los cálculos de inventario los hace el backend.

---

## 6. TanStack Query — Patrones de Uso

### 6.1 Estructura de un hook de query

```typescript
// src/features/requisiciones/useRequisiciones.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { RequisicionRead, RequisicionCreate } from './requisiciones.types'
import type { PaginatedResponse } from '@/types/api'

// Keys centralizadas en el mismo archivo
export const requisicionKeys = {
  all: ['requisiciones'] as const,
  lists: () => [...requisicionKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...requisicionKeys.lists(), filters] as const,
  detail: (id: string) => [...requisicionKeys.all, 'detail', id] as const,
}

export const useRequisiciones = (page = 1, size = 20) => {
  return useQuery({
    queryKey: requisicionKeys.list({ page, size }),
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<RequisicionRead>>(
        '/requisiciones/', { params: { page, size } }
      )
      return data
    },
  })
}

export const useCrearRequisicion = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: RequisicionCreate) => {
      const { data } = await api.post<RequisicionRead>('/requisiciones/', payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requisicionKeys.lists() })
    },
  })
}
```

### 6.2 Reglas de TanStack Query

- Toda operación de lectura: `useQuery`.
- Toda operación de escritura (POST, PATCH, DELETE): `useMutation`.
- Siempre invalidar queries relacionadas en `onSuccess` de mutations.
- No usar `refetchInterval` salvo que el dato sea en tiempo real (saldos de inventario).
- `staleTime` por defecto en `queryClient.ts`: 30 segundos para listas, 5 minutos para catálogos.

---

## 7. Formularios — React Hook Form + Zod

Todo formulario usa `react-hook-form` con resolver de `zod`. El schema de Zod es la única fuente
de validación; no duplicar validaciones en el componente.

```typescript
// src/features/requisiciones/NuevaRequisicionForm.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const schema = z.object({
  fecha_requerida: z.string().optional().nullable(),
  notas: z.string().max(500).optional().nullable(),
})

type FormValues = z.infer<typeof schema>

const NuevaRequisicionForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const { mutate, isPending } = useCrearRequisicion()
  const form = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = (values: FormValues) => {
    mutate(values, { onSuccess })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Guardando...' : 'Crear Requisición'}
        </Button>
      </form>
    </Form>
  )
}
```

---

## 8. Cliente HTTP (Axios)

```typescript
// src/lib/axios.ts
import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,  // ej: http://localhost:8000/api/v1
  headers: { 'Content-Type': 'application/json' },
})

// Interceptor: inyecta el JWT en cada request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Interceptor: manejo global de 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
    }
    return Promise.reject(error)
  }
)
```

**Reglas:**
- Siempre usar `api` (la instancia configurada), nunca `axios` directo ni `fetch`.
- La `baseURL` viene de `import.meta.env.VITE_API_URL`. Nunca hardcodear URLs.

---

## 9. Estado Global — Zustand

Solo usar Zustand para estado verdaderamente global que no es datos del servidor:
usuario autenticado, token, preferencias de UI.

```typescript
// src/stores/authStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Rol } from '@/types/enums'

interface AuthUser {
  id: string
  nombre_completo: string
  email: string
  sucursal_id: string
  sucursal_nombre: string
  sucursal_codigo: string
  rol: Rol
}

interface AuthStore {
  user: AuthUser | null
  token: string | null
  setAuth: (user: AuthUser, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
    }),
    { name: 'wms-auth' }
  )
)
```

**No usar Zustand para:** datos que vienen del API (eso es TanStack Query), estado local de un
componente (eso es `useState`).

---

## 10. Autorización en el Frontend

El hook `usePermissions` centraliza todas las comprobaciones de rol. Los componentes no deben
verificar roles directamente.

```typescript
// src/hooks/usePermissions.ts
import { useAuthStore } from '@/stores/authStore'

export const usePermissions = () => {
  const rol = useAuthStore((s) => s.user?.rol)

  return {
    canCreateRequisicion: ['administrador', 'almacenista', 'encargado_sucursal'].includes(rol ?? ''),
    canApproveRequisicion: ['administrador', 'almacenista'].includes(rol ?? ''),
    canDispatch: ['administrador', 'almacenista'].includes(rol ?? ''),
    canManageCatalog: ['administrador'].includes(rol ?? ''),
    canExportContpaqi: ['administrador', 'contador'].includes(rol ?? ''),
    isReadOnly: rol === 'solo_lectura',
  }
}

// Uso en componente
const { canApproveRequisicion } = usePermissions()
{canApproveRequisicion && <Button onClick={handleAprobar}>Aprobar</Button>}
```

> **Importante:** la autorización del frontend es solo UX (ocultar botones). La autorización real
> la hace el backend. Nunca confiar solo en el frontend para proteger acciones.

---

## 11. Routing y Guards

```typescript
// src/router/index.tsx
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useAuthStore((s) => s.token)
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: <PrivateRoute><AppShell /></PrivateRoute>,
    children: [
      { index: true, element: <Navigate to="/requisiciones" replace /> },
      { path: 'requisiciones', element: <RequisicionesPage /> },
      { path: 'requisiciones/:id', element: <RequisicionDetallePage /> },
      { path: 'despachos', element: <DespachosPage /> },
      { path: 'despachos/:id', element: <DespachoDetallePage /> },
      { path: 'inventario/saldos', element: <SaldosPage /> },
      { path: 'inventario/movimientos', element: <MovimientosPage /> },
      { path: 'inventario/bajo-minimo', element: <ProductosBajoMinimoPage /> },
      { path: 'produccion', element: <OrdenesProduccionPage /> },
      { path: 'catalogo/productos', element: <ProductosPage /> },
      { path: 'contabilidad/exportaciones', element: <ExportacionesPage /> },
    ],
  },
])
```

---

## 12. Diseño Visual y UX

### 12.1 Color de estatus

Usar el componente `StatusBadge` para mostrar cualquier estatus. Nunca inventar colores inline.

```typescript
// src/components/shared/StatusBadge.tsx
const ESTATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  borrador:    { label: 'Borrador',   variant: 'secondary' },
  enviada:     { label: 'Enviada',    variant: 'default' },
  aprobada:    { label: 'Aprobada',   variant: 'default' },     // verde con className
  surtida:     { label: 'Surtida',    variant: 'default' },
  cerrada:     { label: 'Cerrada',    variant: 'outline' },
  rechazada:   { label: 'Rechazada',  variant: 'destructive' },
  pendiente:   { label: 'Pendiente',  variant: 'secondary' },
  en_proceso:  { label: 'En proceso', variant: 'default' },
  completado:  { label: 'Completado', variant: 'outline' },
  cancelado:   { label: 'Cancelado',  variant: 'destructive' },
}
```

### 12.2 Tablas con paginación

Siempre usar el componente `DataTable` (wrapper de TanStack Table) para listas de datos.
Incluye paginación, ordenación por columna y skeleton de carga por defecto.

### 12.3 Feedback de acciones

- Toda mutación exitosa muestra un `toast` de éxito (usar `sonner` de shadcn).
- Toda mutación fallida muestra un `toast` de error con el `detail` del backend.
- Los botones de submit muestran estado `disabled` + texto "Guardando..." mientras `isPending`.
- Las acciones destructivas (rechazar, cancelar) requieren `ConfirmDialog` antes de ejecutar.

### 12.4 Estados de carga

- Listas: usar skeleton de tabla mientras `isLoading`.
- Detalle: usar skeleton de formulario mientras `isLoading`.
- No usar spinners giratorios centrados en página completa (excepción: login inicial).

---

## 13. Variables de Entorno

```env
# .env.example
VITE_API_URL=http://localhost:8000/api/v1
VITE_SUPABASE_URL=https://[ref].supabase.co
VITE_SUPABASE_ANON_KEY=...
```

**Reglas:**
- Solo variables con prefijo `VITE_` son accesibles en el código del cliente.
- `.env.local` está en `.gitignore`. Nunca commitear valores reales.
- Acceder siempre con `import.meta.env.VITE_XXX`, nunca con `process.env`.

---

## 14. Lo que NO debes hacer

- ❌ No usar `any` en TypeScript. Ni una sola vez.
- ❌ No usar `fetch` nativo. Siempre la instancia `api` de Axios.
- ❌ No hardcodear URLs de la API. Siempre `import.meta.env.VITE_API_URL`.
- ❌ No hacer llamadas al API directamente en componentes. Siempre a través de hooks de TanStack Query.
- ❌ No poner lógica de negocio en componentes. Los componentes renderizan, los hooks y services procesan.
- ❌ No usar Context API para estado global. Eso es Zustand.
- ❌ No usar TanStack Query para estado local de UI (modal abierto, tab activo). Eso es `useState`.
- ❌ No calcular cantidades de inventario en el frontend. Eso lo hace el backend.
- ❌ No commitear `.env.local`.
- ❌ No editar manualmente los archivos dentro de `src/components/ui/` (son de shadcn/ui).
- ❌ No mostrar botones de acción que el usuario no tiene permiso de usar. Verificar con `usePermissions`.
- ❌ No usar `parseFloat` / `Number()` para aritmética con cantidades de inventario. Solo para display.
