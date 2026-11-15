# Base de datos

> El modelo mínimo **obligatorio** es la **sección 7 del enunciado** ([01-enunciado.md](01-enunciado.md#7-modelo-de-datos-mínimo)). Acá se documenta cómo lo implementamos.

- **Motor:** SQLite en desarrollo (`DATABASE_URL=file:./local.db`) y libSQL remota (Turso) en producción, con el mismo cliente `@libsql/client`.
- **ORM:** Drizzle. Esquema en `src/db/schema/*.ts`, conexión en `src/db/index.ts`.
- **Migraciones:** `drizzle-kit`. Al cambiar el esquema: `pnpm run db:generate` (crea el SQL en `drizzle/`, que se sube al repo) y `pnpm run db:migrate` (lo aplica).
- **Convenciones:** columnas en `snake_case` en la BD y `camelCase` en TypeScript. Todas las tablas tienen `id` y `created_at`. Importes en centavos (`integer`). Fechas como `integer` en milisegundos (`timestamp_ms`) y en la API como ISO 8601 UTC.

## Tablas implementadas

### `usuarios` — `src/db/schema/usuarios.ts`

| Columna | Tipo | Notas |
| --- | --- | --- |
| `id` | integer PK autoincrement | |
| `email` | text not null, **unique** | Normalizado (trim + minúsculas): CHECK `email = lower(trim(email))` |
| `nombre` | text not null | |
| `password_hash` | text not null | bcrypt (12 rondas). Nunca sale de la capa de servicios |
| `rol` | text not null default `'vendedor'` | CHECK `rol IN ('admin','vendedor')` |
| `activo` | integer (boolean) not null default true | Baja lógica (regla 12) |
| `created_at` | integer (timestamp_ms) not null | |

**Sesiones:** no hay tabla. La cookie `mostrador_sesion` está firmada con HMAC-SHA256 (`SESSION_SECRET`) y contiene `usuarioId.expiraEn.firma`. En cada pedido se busca el usuario en la BD y se verifica que siga activo (sección 10.5). Vence a las 8 horas.

## Pendientes

`categorias`, `productos`, `movimientos_stock`, `clientes`, `facturas`, `factura_items`, `pagos`, `movimientos_cuenta`. Se agregan en sus hitos siguiendo la sección 7.
