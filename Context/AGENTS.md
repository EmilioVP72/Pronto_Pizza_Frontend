# AGENTS.md — WMS Pronto Pizza · Backend

> Este archivo es la fuente de verdad para cualquier agente de IA que trabaje en este repositorio.
> Léelo completo antes de tocar cualquier archivo. No asumas nada que no esté aquí.

---

## 1. Descripción del Proyecto

Sistema de Gestión de Almacén (WMS) para **Pronto Pizza**, una cadena de pizzerías con una cocina
central (Comisariato) y 4 sucursales: **Héroes (HER), Plaza Real (PLZ), Calzada (CAL), San Luis Rey (SLR)**,
más la **Matriz (MTZ)**.

Este repo es exclusivamente el **backend**. El frontend vive en un repositorio separado (`wms-frontend`).

**Problema que resuelve:** reemplazar la gestión de inventario basada en Excel por un WMS centralizado
que controle requisiciones, despachos, trazabilidad de lotes y exportación contable a CONTPAQI.

---

## 2. Stack Técnico

| Capa | Tecnología | Versión mínima |
|---|---|---|
| Lenguaje | Python | 3.12 |
| Framework web | FastAPI | 0.115+ |
| ORM | SQLAlchemy | 2.0+ (async) |
| Validación | Pydantic | v2 |
| Migraciones | Alembic | 1.13+ |
| Base de datos | PostgreSQL vía Supabase | 15+ |
| Driver async | asyncpg | 0.29+ |
| Testing | pytest + pytest-asyncio | — |
| Servidor ASGI | Uvicorn | — |
| Autenticación | Supabase Auth (JWT) | — |

**No usar:** Django, Flask, SQLModel como sustituto de SQLAlchemy directo, requests síncrono donde
haya alternativa async.

---

## 3. Estructura de Carpetas

```
wms-backend/
├── app/
│   ├── main.py                  # Entrypoint FastAPI, registro de routers, CORS, lifespan
│   ├── core/
│   │   ├── config.py            # Settings con pydantic-settings (.env)
│   │   ├── database.py          # Engine async, SessionLocal, get_db dependency
│   │   └── security.py          # Verificación JWT Supabase, get_current_user
│   ├── models/                  # SQLAlchemy ORM models (un archivo por dominio)
│   │   ├── __init__.py
│   │   ├── organizacion.py      # Empresa, Sucursal, Rol, Usuario
│   │   ├── catalogo.py          # Producto, CategoriaProducto, UnidadMedida, ProductoSucursal
│   │   ├── inventario.py        # Lote, SaldoInventario, MovimientoInventario, TipoMovimiento
│   │   ├── requisiciones.py     # Requisicion, RequisicionDetalle
│   │   ├── despachos.py         # Despacho, DespachoDetalle, TipoDocumentoSalida
│   │   ├── produccion.py        # Receta, RecetaIngrediente, OrdenProduccion
│   │   └── contabilidad.py      # ExportacionContpaqi, LineaContpaqi
│   ├── schemas/                 # Pydantic v2 schemas (un archivo por dominio, espeja models/)
│   │   ├── __init__.py
│   │   ├── organizacion.py
│   │   ├── catalogo.py
│   │   ├── inventario.py
│   │   ├── requisiciones.py
│   │   ├── despachos.py
│   │   ├── produccion.py
│   │   └── contabilidad.py
│   ├── api/
│   │   ├── __init__.py
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── router.py        # Agrega todos los sub-routers bajo /api/v1
│   │       ├── organizacion.py
│   │       ├── catalogo.py
│   │       ├── inventario.py
│   │       ├── requisiciones.py
│   │       ├── despachos.py
│   │       ├── produccion.py
│   │       └── contabilidad.py
│   ├── services/                # Lógica de negocio (no va en routers ni en models)
│   │   ├── __init__.py
│   │   ├── inventario_service.py   # Registrar movimientos, calcular saldos
│   │   ├── requisicion_service.py  # Ciclo de vida de requisiciones
│   │   ├── despacho_service.py     # Crear despacho, determinar tipo de documento
│   │   ├── produccion_service.py   # Ejecutar orden de producción
│   │   └── contpaqi_service.py     # Generar exportación CONTPAQI
│   └── utils/
│       ├── folio.py             # Generación de folios (REQ-HER-YYYYMMDD-NNN)
│       └── pagination.py        # Helpers de paginación
├── alembic/
│   ├── env.py
│   └── versions/                # Archivos de migración generados por alembic
├── tests/
│   ├── conftest.py              # Fixtures: DB de test, cliente async, usuario de prueba
│   ├── test_requisiciones.py
│   ├── test_despachos.py
│   ├── test_inventario.py
│   └── test_produccion.py
├── .env.example                 # Variables requeridas (sin valores reales)
├── .env                         # ← NUNCA commitear, está en .gitignore
├── alembic.ini
├── pyproject.toml               # Dependencias con uv o poetry
├── Dockerfile
└── AGENTS.md                    # Este archivo
```

---

## 4. Base de Datos — Reglas Críticas

La BD está en **Supabase (PostgreSQL 15+)**. El schema completo está en `schema.sql` en el repo
`wms-db` o en la documentación del proyecto. Aquí están las reglas de negocio que el agente DEBE
respetar al generar código:

### 4.1 El inventario es un ledger inmutable

`movimientos_inventario` es como un libro contable: **solo se insertan registros, nunca se
modifican ni eliminan**. Los errores se corrigen con movimientos compensatorios (un
`AJU_POSITIVO` o `AJU_NEGATIVO`). Si el agente genera código con `UPDATE` o `DELETE` sobre
esta tabla, está mal.

```python
# CORRECTO: siempre INSERT
await db.execute(insert(MovimientoInventario).values(...))

# INCORRECTO: nunca
await db.execute(update(MovimientoInventario).where(...))  # ❌
await db.execute(delete(MovimientoInventario).where(...))  # ❌
```

### 4.2 saldos_inventario lo actualiza un trigger de PostgreSQL

La tabla `saldos_inventario` tiene un trigger (`trg_actualizar_saldo`) que se dispara
automáticamente después de cada INSERT en `movimientos_inventario`. **El backend NO debe
actualizar `saldos_inventario` directamente**. Solo inserta en `movimientos_inventario` y el
trigger hace el resto.

```python
# CORRECTO: solo insertar el movimiento
await db.execute(insert(MovimientoInventario).values(...))
await db.commit()
# El trigger actualizó saldos_inventario automáticamente ✓

# INCORRECTO
await db.execute(update(SaldoInventario).where(...).values(cantidad=nueva_cantidad))  # ❌
```

### 4.3 Lógica de diferenciación legal de documentos

Al crear un despacho, el tipo de documento se determina comparando las `empresa_id` de las
sucursales origen y destino:

- `sucursal_origen.empresa_id == sucursal_destino.empresa_id` → `NOTA_TRASLADO`
- `sucursal_origen.empresa_id != sucursal_destino.empresa_id` → `FACTURA` o `NOTA_VENTA`

Esta lógica vive en `services/despacho_service.py`, no en el router.

```python
# En despacho_service.py
async def determinar_tipo_documento(
    db: AsyncSession,
    sucursal_origen_id: UUID,
    sucursal_destino_id: UUID,
) -> TipoDocumentoSalida:
    origen = await db.get(Sucursal, sucursal_origen_id)
    destino = await db.get(Sucursal, sucursal_destino_id)
    if origen.empresa_id == destino.empresa_id:
        return await _get_tipo_documento(db, "NOTA_TRASLADO")
    return await _get_tipo_documento(db, "FACTURA")
```

### 4.4 Tipos de datos monetarios y de cantidad

Siempre usar `Decimal` de Python para cantidades y precios, nunca `float`.

```python
from decimal import Decimal

# CORRECTO
cantidad: Decimal = Decimal("10.5000")

# INCORRECTO
cantidad: float = 10.5  # ❌ errores de punto flotante en inventario
```

En Pydantic schemas, usar `Decimal` con validación de precisión:

```python
from pydantic import condecimal
cantidad: condecimal(max_digits=12, decimal_places=4)
```

### 4.5 Soft delete en catálogos

Las tablas de catálogo (`productos`, `sucursales`, `usuarios`, `lotes`, `productos_sucursal`)
tienen campo `activo: bool`. **Nunca hacer DELETE físico**. Siempre `UPDATE activo = FALSE`.

```python
# CORRECTO
await db.execute(
    update(Producto).where(Producto.id == producto_id).values(activo=False)
)

# INCORRECTO
await db.delete(producto_obj)  # ❌
```

---

## 5. Convenciones de Código

### 5.1 Nombrado

- Archivos y módulos: `snake_case`
- Clases ORM: `PascalCase` singular (`Producto`, `MovimientoInventario`)
- Tablas en BD: `snake_case` plural (`productos`, `movimientos_inventario`)
- Variables y funciones: `snake_case`
- Constantes: `UPPER_SNAKE_CASE`
- UUIDs: siempre `uuid.UUID` de Python, no strings

### 5.2 Estructura de un router (patrón obligatorio)

```python
# app/api/v1/requisiciones.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.organizacion import Usuario
from app.schemas.requisiciones import RequisicionCreate, RequisicionRead, RequisicionUpdate
from app.services.requisicion_service import RequisicionService

router = APIRouter(prefix="/requisiciones", tags=["Requisiciones"])


@router.get("/", response_model=list[RequisicionRead])
async def listar_requisiciones(
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    return await RequisicionService.listar(db, current_user)


@router.post("/", response_model=RequisicionRead, status_code=status.HTTP_201_CREATED)
async def crear_requisicion(
    data: RequisicionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    return await RequisicionService.crear(db, data, current_user)
```

### 5.3 Estructura de un service (patrón obligatorio)

La lógica de negocio va en el service, no en el router. Los routers solo validan entrada,
llaman al service y devuelven la respuesta.

```python
# app/services/requisicion_service.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID

from app.models.requisiciones import Requisicion
from app.models.organizacion import Usuario
from app.schemas.requisiciones import RequisicionCreate


class RequisicionService:

    @staticmethod
    async def crear(
        db: AsyncSession,
        data: RequisicionCreate,
        current_user: Usuario,
    ) -> Requisicion:
        requisicion = Requisicion(
            sucursal_id=current_user.sucursal_id,
            creado_por_id=current_user.id,
            **data.model_dump(exclude_unset=True),
        )
        db.add(requisicion)
        await db.commit()
        await db.refresh(requisicion)
        return requisicion
```

### 5.4 Schemas Pydantic

Cada entidad tiene al menos 3 schemas:
- `XxxCreate` — campos para crear (sin id, sin timestamps)
- `XxxUpdate` — campos opcionales para actualizar
- `XxxRead` — respuesta completa incluyendo id y timestamps

```python
from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from decimal import Decimal


class RequisicionCreate(BaseModel):
    fecha_requerida: date | None = None
    notas: str | None = None


class RequisicionUpdate(BaseModel):
    fecha_requerida: date | None = None
    notas: str | None = None


class RequisicionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    sucursal_id: UUID
    folio: str
    estatus: str
    fecha_requerida: date | None
    notas: str | None
    creado_por_id: UUID
    creado_en: datetime
    actualizado_en: datetime
```

### 5.5 Manejo de errores

Usar `HTTPException` con códigos semánticos. Nunca devolver 200 con un campo `error` en el body.

```python
from fastapi import HTTPException, status

# 404 cuando no existe
raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Requisición no encontrada")

# 400 cuando la transición de estado no es válida
raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No se puede aprobar una requisición en estado 'cerrada'")

# 403 cuando no tiene permiso
raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo el almacenista puede aprobar requisiciones")
```

### 5.6 Async en todo

Todas las funciones que tocan la BD son `async`. No usar operaciones síncronas de SQLAlchemy
(`session.execute` síncrono) en handlers de FastAPI.

```python
# CORRECTO
async def get_producto(db: AsyncSession, producto_id: UUID) -> Producto | None:
    result = await db.execute(select(Producto).where(Producto.id == producto_id))
    return result.scalar_one_or_none()

# INCORRECTO
def get_producto(db: Session, producto_id: UUID):  # ❌ síncrono
    return db.query(Producto).filter(Producto.id == producto_id).first()
```

---

## 6. Autenticación y Autorización

### 6.1 Supabase JWT

El frontend obtiene el JWT de Supabase Auth y lo envía en el header:
`Authorization: Bearer <token>`

El backend verifica el JWT con la clave pública de Supabase (variable `SUPABASE_JWT_SECRET`).
Del token se extrae el `sub` (UUID del usuario en `auth.users`), que se mapea con
`usuarios.auth_user_id` para obtener el usuario interno con su `sucursal_id` y `rol_id`.

```python
# app/core/security.py
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> Usuario:
    try:
        payload = jwt.decode(token, settings.SUPABASE_JWT_SECRET, algorithms=["HS256"])
        auth_user_id: str = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")

    result = await db.execute(
        select(Usuario).where(Usuario.auth_user_id == UUID(auth_user_id))
    )
    user = result.scalar_one_or_none()
    if not user or not user.activo:
        raise HTTPException(status_code=401, detail="Usuario no encontrado o inactivo")
    return user
```

### 6.2 Roles

Los 5 roles del sistema y sus permisos clave:

| Rol | Puede crear req. | Puede aprobar req. | Puede despachar | Puede exportar CONTPAQI |
|---|---|---|---|---|
| `administrador` | ✅ | ✅ | ✅ | ✅ |
| `almacenista` | ✅ | ✅ | ✅ | ❌ |
| `encargado_sucursal` | ✅ | ❌ | ❌ | ❌ |
| `contador` | ❌ | ❌ | ❌ | ✅ |
| `solo_lectura` | ❌ | ❌ | ❌ | ❌ |

Crear un decorator/dependency `require_role(*roles)` para proteger endpoints:

```python
def require_role(*roles: str):
    async def dependency(current_user: Usuario = Depends(get_current_user)):
        if current_user.rol.nombre not in roles:
            raise HTTPException(status_code=403, detail="Permisos insuficientes")
        return current_user
    return dependency

# Uso en router
@router.post("/aprobar/{requisicion_id}")
async def aprobar_requisicion(
    requisicion_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(require_role("administrador", "almacenista")),
):
    ...
```

---

## 7. Dominio de Negocio — Flujos Críticos

### 7.1 Ciclo de vida de una Requisición

```
borrador → enviada → aprobada → surtida → cerrada
                  ↘                     ↗
                   rechazada ←─────────
```

Transiciones válidas (validar en `requisicion_service.py`):

| Estado actual | Acción | Estado nuevo | Rol requerido |
|---|---|---|---|
| `borrador` | enviar | `enviada` | `encargado_sucursal`, `almacenista`, `administrador` |
| `enviada` | aprobar | `aprobada` | `almacenista`, `administrador` |
| `enviada` | rechazar | `rechazada` | `almacenista`, `administrador` |
| `aprobada` | surtir | `surtida` | `almacenista`, `administrador` |
| `aprobada` | rechazar | `rechazada` | `almacenista`, `administrador` |
| `surtida` | cerrar | `cerrada` | `almacenista`, `administrador` |

Cualquier otra transición lanza `HTTP 400`.

### 7.2 Ciclo de vida de un Despacho

```
pendiente → en_proceso → completado
          ↘
           cancelado
```

Al pasar a `completado`:
1. El service llama a `inventario_service.registrar_movimiento()` para cada línea del despacho.
2. Eso crea registros en `movimientos_inventario` (tipo `SAL_REQUISICION`).
3. El trigger de PostgreSQL actualiza `saldos_inventario` automáticamente.
4. Si el despacho tiene `requisicion_id`, actualizar la requisición a `surtida`.

### 7.3 Ciclo de vida de una Orden de Producción

```
programada → en_proceso → completada
           ↘
            cancelada
```

Al pasar a `completada`:
1. Por cada ingrediente de la receta × tandas: crear movimiento `SAL_MERMA` (consumo de insumos).
2. Crear un `Lote` nuevo para el preparado resultante.
3. Crear movimiento `ENT_PRODUCCION` para el lote generado.
4. Asignar `lote_resultado_id` en la `OrdenProduccion`.

---

## 8. Variables de Entorno

```env
# .env.example

# Supabase
DATABASE_URL=postgresql+asyncpg://postgres:[password]@db.[ref].supabase.co:5432/postgres
SUPABASE_URL=https://[ref].supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_JWT_SECRET=...

# App
APP_ENV=development          # development | staging | production
SECRET_KEY=...               # Para signing interno si aplica
CORS_ORIGINS=http://localhost:5173,https://wms.prontopizza.com

# Logging
LOG_LEVEL=INFO
```

**Reglas:**
- `.env` está en `.gitignore`. Nunca commitear valores reales.
- En producción, las variables se inyectan por el entorno (Render/Railway dashboard).
- Acceder siempre vía `settings` (instancia de `app/core/config.py`), nunca con `os.environ` directo.

```python
# app/core/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    supabase_url: str
    supabase_anon_key: str
    supabase_jwt_secret: str
    app_env: str = "development"
    cors_origins: list[str] = ["http://localhost:5173"]
    log_level: str = "INFO"

    class Config:
        env_file = ".env"

settings = Settings()
```

---

## 9. API — Prefijos y Versionado

Todos los endpoints bajo `/api/v1/`. Ejemplos de rutas:

```
GET    /api/v1/requisiciones/
POST   /api/v1/requisiciones/
GET    /api/v1/requisiciones/{id}
PATCH  /api/v1/requisiciones/{id}/enviar
PATCH  /api/v1/requisiciones/{id}/aprobar
PATCH  /api/v1/requisiciones/{id}/rechazar

GET    /api/v1/despachos/
POST   /api/v1/despachos/
PATCH  /api/v1/despachos/{id}/completar
PATCH  /api/v1/despachos/{id}/cancelar

GET    /api/v1/inventario/saldos/
GET    /api/v1/inventario/movimientos/
GET    /api/v1/inventario/productos-bajo-minimo/

GET    /api/v1/productos/
POST   /api/v1/productos/
GET    /api/v1/productos/{id}
PUT    /api/v1/productos/{id}
DELETE /api/v1/productos/{id}          # Soft delete: activo=False

GET    /api/v1/sucursales/
GET    /api/v1/lotes/
GET    /api/v1/ordenes-produccion/
POST   /api/v1/ordenes-produccion/
PATCH  /api/v1/ordenes-produccion/{id}/completar

POST   /api/v1/contpaqi/exportar/
GET    /api/v1/contpaqi/exportaciones/
```

Respuestas paginadas usan query params: `?page=1&size=20`.
Respuesta paginada estándar:

```json
{
  "items": [...],
  "total": 150,
  "page": 1,
  "size": 20,
  "pages": 8
}
```

---

## 10. Testing

- Un test por flujo crítico de negocio, no solo por endpoint.
- Usar una BD de test separada (SQLite en memoria o PostgreSQL de test en Supabase).
- Los fixtures de `conftest.py` crean usuario, sucursal y empresa de prueba antes de cada test.
- Cubrir siempre: el happy path + el caso de transición de estado inválida + el caso de permiso insuficiente.

```python
# tests/test_requisiciones.py
async def test_encargado_no_puede_aprobar(client, encargado_token, requisicion_enviada):
    response = await client.patch(
        f"/api/v1/requisiciones/{requisicion_enviada.id}/aprobar",
        headers={"Authorization": f"Bearer {encargado_token}"},
    )
    assert response.status_code == 403
```

---

## 11. Lo que NO debes hacer

- ❌ No usar `SELECT *` en queries SQLAlchemy. Seleccionar solo las columnas necesarias.
- ❌ No hacer queries dentro de loops (N+1). Usar `joinedload` o `selectinload`.
- ❌ No modificar `saldos_inventario` directamente desde el backend.
- ❌ No usar `float` para cantidades o precios. Solo `Decimal`.
- ❌ No hacer DELETE físico en tablas de catálogo. Soft delete con `activo=False`.
- ❌ No escribir lógica de negocio en los routers. Los routers solo rutean.
- ❌ No commitear el `.env`.
- ❌ No usar el usuario `service_role` de Supabase desde el backend en producción.
- ❌ No modificar ni eliminar registros de `movimientos_inventario`.
- ❌ No hacer transiciones de estado arbitrarias en requisiciones/despachos. Validar siempre.
