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
| — | Categorías, productos, movimientos | — | Pendiente (hito 1) |
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
