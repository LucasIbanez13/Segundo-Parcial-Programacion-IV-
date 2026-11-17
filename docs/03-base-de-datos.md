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

### `categorias` — `src/db/schema/categorias.ts`

| Columna | Tipo | Notas |
| --- | --- | --- |
| `id` | integer PK autoincrement | |
| `nombre` | text not null | Como lo escribió el usuario |
| `nombre_normalizado` | text not null | Minúsculas calculadas en TypeScript (`toLocaleLowerCase("es-AR")`). Índice único `categorias_nombre_unico`. No se usa `lower()` de SQLite porque no convierte letras acentuadas ("PINTURERÍA" ≠ "pinturería") |
| `activa` | integer (boolean) not null default true | Baja lógica |
| `created_at` | integer (timestamp_ms) not null | |

### `productos` — `src/db/schema/productos.ts`

| Columna | Tipo | Notas |
| --- | --- | --- |
| `id` | integer PK autoincrement | |
| `codigo` | text not null | Índice único `productos_codigo_unico` sobre `lower(codigo)`. Zod solo acepta letras sin acento, números y `. _ - /`, así `lower()` alcanza |
| `descripcion` | text not null | |
| `categoria_id` | integer not null FK → `categorias.id` | Índice `productos_categoria_idx` |
| `precio` | integer not null | Centavos. CHECK `precio > 0` |
| `existencia` | integer not null default 0 | CHECK `>= 0`. **Solo la cambia `moverStock()`** |
| `stock_minimo` | integer not null default 0 | CHECK `>= 0` |
| `activo` | integer (boolean) not null default true | Baja lógica (RF-P3) |
| `created_at` | integer (timestamp_ms) not null | |

### `movimientos_stock` — `src/db/schema/movimientos-stock.ts`

| Columna | Tipo | Notas |
| --- | --- | --- |
| `id` | integer PK autoincrement | |
| `producto_id` | integer not null FK → `productos.id` | |
| `usuario_id` | integer not null FK → `usuarios.id` | Trazabilidad (regla 11) |
| `factura_id` | integer null | Ventas y anulaciones. La FK a `facturas` se agrega en el hito 3 |
| `tipo` | text not null | CHECK `IN ('venta','anulacion','ingreso','egreso')` |
| `cantidad` | integer not null | Con signo. CHECK `<> 0` y signo según el tipo (venta/egreso < 0, ingreso/anulación > 0) |
| `existencia_resultante` | integer not null | CHECK `>= 0` |
| `motivo` | text not null | |
| `observacion` | text null | |
| `fecha` | integer (timestamp_ms) not null | |
| `created_at` | integer (timestamp_ms) not null | |

Índices: `(producto_id, fecha)` para el historial de un producto y `(fecha)` para el listado general.

**Regla 2:** `moverStock()` (`src/services/stock.service.ts`) hace `UPDATE productos SET existencia = existencia + ? WHERE id = ? AND existencia + ? >= 0` y graba el movimiento en la misma transacción. Si el UPDATE no toca ninguna fila → `409 STOCK_INSUFICIENTE`. Las transacciones de libSQL abren con `BEGIN IMMEDIATE`, así que dos escrituras simultáneas se serializan.

### `numeradores` — `src/db/schema/numeradores.ts`

| Columna | Tipo | Notas |
| --- | --- | --- |
| `id` | integer PK autoincrement | |
| `clave` | text not null, **unique** | Serie, por ejemplo `factura-0001` o `recibo` |
| `ultimo_numero` | integer not null default 0 | CHECK `>= 0` |
| `created_at` | integer (timestamp_ms) not null | |

Lo usan ventas y pagos (regla 4): incrementan `ultimo_numero` dentro de la transacción que graba el comprobante.

### `clientes` — `src/db/schema/clientes.ts`

| Columna | Tipo | Notas |
| --- | --- | --- |
| `id` | integer PK autoincrement | |
| `tipo_doc` | text not null | CHECK `IN ('DNI','CUIT')` |
| `nro_doc` | text not null | Formateado para mostrar |
| `nro_doc_normalizado` | text not null, **unique** | Solo dígitos: documento único |
| `nombre` | text not null | |
| `nombre_busqueda` | text not null | Sin acentos ni mayúsculas, para buscar con `LIKE` |
| `domicilio`, `telefono`, `email` | text null | |
| `cuenta_corriente` | integer (boolean) not null default false | |
| `limite_credito` | integer null | Centavos. `null` = sin límite. CHECK `> 0` |
| `activo` | integer (boolean) not null default true | Baja lógica |
| `created_at` | integer (timestamp_ms) not null | |

El saldo **no** se guarda: es Σ débitos − Σ créditos de `movimientos_cuenta` (regla 7).

### `pagos` — `src/db/schema/pagos.ts`

`punto_venta` + `numero` (únicos juntos: recibo `R 0001-00000001`), `fecha`, `importe` (CHECK `> 0`), `medio` (`efectivo`, `transferencia`, `tarjeta_debito`), `observacion`, `cliente_id` FK, `usuario_id` FK, `created_at`.

### `movimientos_cuenta` — `src/db/schema/movimientos-cuenta.ts`

`tipo` (`debito` | `credito`), `importe` (siempre positivo, CHECK `> 0`), `fecha`, `descripcion`, `cliente_id` FK, `factura_id` FK null, `pago_id` FK null, `created_at`. Índice `(cliente_id, fecha)`. Débitos: ventas a cuenta. Créditos: pagos y anulaciones.

### `facturas` y `factura_items` — `src/db/schema/facturas.ts`

- `facturas`: `punto_venta` + `numero` (únicos juntos), `fecha`, `total`, `forma` (`contado`, `tarjeta`, `cuenta_corriente`), `tarjeta_tipo`, `tarjeta_marca`, `tarjeta_ultimos4` (regla 9: nunca el número completo), `monto_recibido`, `estado` (`emitida` | `anulada`), `motivo_anulacion`, `anulada_en`, `anulada_por_id` FK, `cliente_id` FK null (consumidor final), `usuario_id` FK, `created_at`. CHECK: cuenta corriente exige cliente; datos de tarjeta solo con tarjeta (4 dígitos); `monto_recibido >= total` solo en contado; anulada exige motivo, fecha y usuario.
- `factura_items`: `factura_id` FK, `producto_id` FK, `codigo` y `descripcion` copiados del catálogo, `cantidad` (CHECK `> 0`), `precio_unitario` (congelado, regla 3), `subtotal` (CHECK `= cantidad × precio_unitario`), `created_at`. UNIQUE `(factura_id, producto_id)`.

Emitir y anular son una sola transacción en `facturas.service.ts`: factura, renglones, `moverStock()` y movimiento de cuenta.

## Pendientes

`movimientos_stock.factura_id` todavía no tiene la FK a `facturas` (Elias).
