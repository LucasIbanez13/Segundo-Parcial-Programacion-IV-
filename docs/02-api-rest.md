# API REST

> El contrato **obligatorio** es la **sección 11 del enunciado** ([01-enunciado.md](01-enunciado.md#11-api-rest)): rutas, campos, códigos HTTP y formato de error se respetan tal cual. Este archivo solo agrega las decisiones de implementación del equipo.

## Cómo está implementada

- Cada ruta es un `route.ts` en `src/app/api/**` y usa el envoltorio `ruta()` de [`src/lib/http/ruta.ts`](../src/lib/http/ruta.ts):
  exige la sesión (salvo `{ publica: true }`), lee params, query y JSON, y convierte cualquier error a `{ error: { code, message, details } }`.
- La ruta **solo** llama al servicio y responde. Validación (Zod), rol y reglas viven en `src/services/*.service.ts`.
- Helpers de respuesta: `creado(datos, location)` → `201` + `Location`; `sinContenido()` → `204`.
- Id de ruta inválido (`/api/usuarios/abc`) → `404 NO_ENCONTRADO` (`src/lib/http/parametros.ts`).
- Campos extra en el cuerpo → `422 VALIDACION` (esquemas `.strict()`), con `details: [{ campo, mensaje }]`.
- Protección CSRF: además de `SameSite=Lax`, en métodos que modifican datos se rechaza (`403`) un header `Origin` de otro sitio.
- Los errores inesperados se registran con `console.error` y responden `500 ERROR_INTERNO` sin detalle.

## Estado de las rutas

| Método | Ruta | Rol | Estado |
| --- | --- | --- | --- |
| POST | `/api/auth/login` | Público | ✅ |
| POST | `/api/auth/logout` | Ambos | ✅ |
| GET | `/api/auth/me` | Ambos | ✅ |
| PUT | `/api/auth/password` | Ambos | ✅ |
| GET · POST | `/api/usuarios` | Admin | ✅ |
| PATCH | `/api/usuarios/{id}` | Admin | ✅ |
| POST | `/api/usuarios/{id}/reset-password` | Admin | ✅ |
| GET · POST | `/api/categorias` | Ambos · Admin | ✅ |
| PATCH | `/api/categorias/{id}` | Admin | ✅ |
| GET · POST | `/api/productos` | Ambos · Admin | ✅ |
| GET · PATCH | `/api/productos/{id}` | Ambos · Admin | ✅ |
| GET · POST | `/api/productos/{id}/movimientos` | Ambos · Admin | ✅ |
| GET | `/api/movimientos-stock` | Ambos | ✅ |
| — | Clientes, cuenta, pagos | — | Pendiente (hito 2) |
| — | Facturas | — | Pendiente (hito 3) |
| — | Tablero | — | Pendiente (hito 4) |

## Decisiones sobre usuarios

- En `usuarios.service` el rol se verifica **antes** de validar: todo el módulo es solo admin, así que un vendedor recibe `403 SIN_PERMISO` aunque mande datos inválidos (lista de control 10.8, punto 2).
- `GET /api/usuarios`: `activo` acepta `true`, `false` o `todos`; si se omite equivale a `todos`. Orden por nombre e id.
- `POST /api/usuarios` no acepta `activo`: el usuario nace activo.
- Cada usuario devuelve `{ id, nombre, email, rol, activo, createdAt }`. Nunca el hash.
- `PATCH` sobre uno mismo con `activo: false` o `rol: "vendedor"` → `422 OPERACION_SOBRE_SI_MISMO`. Así siempre queda al menos un admin activo.
- `PUT /api/auth/password` también rechaza (`422 VALIDACION`) que la nueva sea igual a la actual.

## Decisiones sobre productos y stock

- En las operaciones solo admin (alta y edición de categorías y productos, movimientos manuales) el rol se verifica **antes** de validar, igual que en usuarios.
- `GET /api/categorias`: por defecto solo las activas, sin paginar. El admin puede pedir `activa=false` o `activa=todos` (para reactivarlas desde su pantalla); un vendedor que lo pida recibe `403`.
- `GET /api/productos`: `activo` por defecto `true`; `false` y `todos` son solo para el admin (`403` al vendedor). Orden por código.
- `bajoMinimo` es `existencia < stockMinimo`. `bajoMinimo=false` trae los que no están bajo el mínimo.
- Nombre de categoría y código de producto son únicos **sin distinguir mayúsculas** (`HE-001` = `he-001`, `Pinturería` = `PINTURERÍA`).
- El código de producto solo acepta letras sin acento, números y `. _ - /`, sin espacios (`422 VALIDACION`).
- La búsqueda `q` no distingue mayúsculas en letras sin acento (es el `LIKE` de SQLite).
- `existencia` en `POST` o `PATCH` de productos → `422 VALIDACION` con un mensaje propio en `details`.
- La categoría de un producto activo tiene que existir y estar activa; si no, `422 VALIDACION` en `categoriaId`. Por eso no se puede reactivar un producto de una categoría inactiva.
- `stockInicial` (opcional, ≥ 0): si es mayor que 0 se graba un ingreso con motivo *Stock inicial* en la misma transacción del alta.
- `POST /api/productos/{id}/movimientos`: el motivo se valida según el tipo (lista cerrada de la sección 11.4). Solo `ingreso` y `egreso`: ventas y anulaciones los genera el módulo de facturas.
- `STOCK_INSUFICIENTE` trae `details: [{ productoId, codigo, existencia, solicitada }]`.
- Los movimientos agregan `observacion`. `referencia` es `null` hasta que exista la tabla `facturas` (hito 3), que completa el `numero`.
- `desde`/`hasta` en `GET /api/movimientos-stock`: días `AAAA-MM-DD` en hora de Argentina (UTC−3), ambos incluidos.
