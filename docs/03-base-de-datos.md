# Base de datos

> Modelo **obligatorio** del proyecto (PostgreSQL + Drizzle). En la BD se usa `snake_case`; en JavaScript y la API, `camelCase`. Importes en **centavos enteros**.

## Tablas

### `usuarios` → `src/db/schema/usuarios.js`
| Columna | Tipo | Notas |
| --- | --- | --- |
| `id` | serial PK | |
| `nombre` | text not null | |
| `acceso` | text not null **unique** | normalizado: trim + minúsculas |
| `clave_hash` | text not null | bcrypt. Nunca se devuelve en la API |
| `activo` | boolean not null default true | |
| `administrador` | boolean not null default false | |

### `sesiones` → `src/db/schema/sesiones.js` (infraestructura, no es del negocio)
| Columna | Tipo | Notas |
| --- | --- | --- |
| `id` | text PK | token aleatorio (≥ 32 bytes, `crypto.randomBytes`) |
| `usuario_id` | integer FK → usuarios not null | |
| `expira_en` | timestamptz not null | |
| `creada_en` | timestamptz not null default now() | |

Cerrar sesión = borrar la fila. Desactivar un usuario = borrar sus sesiones.

### `clientes` → `src/db/schema/clientes.js`
| Columna | Tipo | Notas |
| --- | --- | --- |
| `id` | serial PK | |
| `nombre` | text not null | nombre y apellido o razón social |
| `documento` | text not null | |
| `telefono` | text null | |
| `correo` | text null | CHECK: `telefono` o `correo` no nulo |

> No hay columna de saldo: se **calcula**.

### `productos` → `src/db/schema/productos.js`
| Columna | Tipo | Notas |
| --- | --- | --- |
| `id` | serial PK | |
| `codigo` | text not null | **único sin distinguir mayúsculas** (índice único sobre `lower(codigo)`) |
| `nombre` | text not null | |
| `precio_venta_centavos` | integer not null | CHECK > 0 |
| `stock_actual` | integer not null default 0 | CHECK >= 0 |
| `activo` | boolean not null default true | |

### `ventas` → `src/db/schema/ventas.js`
| Columna | Tipo | Notas |
| --- | --- | --- |
| `id` | serial PK | |
| `numero` | integer not null **unique** | generado por secuencia/identity. Nunca `MAX+1` |
| `fecha` | timestamptz not null default now() | |
| `cliente_id` | integer FK → clientes **null** | null = consumidor final |
| `usuario_id` | integer FK → usuarios not null | |
| `cliente_nombre` | text not null | copia histórica ("Consumidor final" si no hay cliente) |
| `cliente_documento` | text null | copia histórica |
| `forma_pago` | text not null | `CONTADO` \| `TARJETA` \| `CUENTA_CORRIENTE`. CHECK: cuenta corriente ⇒ `cliente_id` no nulo |
| `total_centavos` | integer not null | suma de subtotales |

### `detalles_venta` → `src/db/schema/detallesVenta.js`
| Columna | Tipo | Notas |
| --- | --- | --- |
| `id` | serial PK | |
| `venta_id` | integer FK → ventas not null | |
| `producto_id` | integer FK → productos not null | |
| `descripcion` | text not null | copia histórica del nombre |
| `cantidad` | integer not null | CHECK > 0 |
| `precio_unitario_centavos` | integer not null | copia histórica |
| `subtotal_centavos` | integer not null | = cantidad × precio_unitario |

UNIQUE (`venta_id`, `producto_id`) — las cantidades repetidas se agrupan.

### `movimientos_stock` → `src/db/schema/movimientosStock.js`
| Columna | Tipo | Notas |
| --- | --- | --- |
| `id` | serial PK | |
| `producto_id` | integer FK → productos not null | |
| `usuario_id` | integer FK → usuarios not null | |
| `detalle_venta_id` | integer FK → detalles_venta **null, unique** | solo en origen `VENTA` |
| `fecha` | timestamptz not null default now() | |
| `tipo` | text not null | `ENTRADA` \| `SALIDA` |
| `cantidad` | integer not null | CHECK > 0 |
| `motivo` | text not null | |
| `origen` | text not null | `INICIAL` \| `MANUAL` \| `VENTA` |

Reglas: `INICIAL` ⇒ `ENTRADA` y detalle nulo. `MANUAL` ⇒ detalle nulo. `VENTA` ⇒ `SALIDA` y detalle no nulo.

### `pagos` → `src/db/schema/pagos.js`
| Columna | Tipo | Notas |
| --- | --- | --- |
| `id` | serial PK | |
| `cliente_id` | integer FK → clientes not null | |
| `usuario_id` | integer FK → usuarios not null | |
| `fecha` | timestamptz not null | no futura |
| `importe_centavos` | integer not null | CHECK > 0 |
| `observacion` | text null | |

## Relaciones

| Origen | Cardinalidad | Destino |
| --- | --- | --- |
| usuarios | 1 — 0..N | ventas |
| clientes | 0..1 — 0..N | ventas (venta sin cliente = consumidor final) |
| ventas | 1 — 1..N | detalles_venta |
| productos | 1 — 0..N | detalles_venta |
| productos | 1 — 0..N | movimientos_stock |
| usuarios | 1 — 0..N | movimientos_stock |
| detalles_venta | 1 — 1 | movimientos_stock (cada detalle confirmado genera exactamente una salida) |
| clientes | 1 — 0..N | pagos |
| usuarios | 1 — 0..N | pagos |

## Invariantes (no romper nunca)

1. `productos.stock_actual` = Σ entradas − Σ salidas de sus movimientos. Se actualizan **juntos en la misma transacción**.
2. Venta + detalles + salidas de stock se registran en **una sola transacción**. La FK y el UNIQUE no garantizan por sí solos que la salida exista: lo garantiza la lógica de `ventas.service.js`.
3. Saldo del cliente = Σ `ventas.total_centavos` con `forma_pago = 'CUENTA_CORRIENTE'` − Σ `pagos.importe_centavos`. **No** se guarda en ninguna columna.
4. Los pagos se validan contra el saldo dentro de una transacción serializada por cliente (`SELECT ... FOR UPDATE` sobre el cliente).
5. No se borran registros referenciados por el historial (ventas, detalles, movimientos, pagos). Productos y usuarios: baja lógica con `activo = false`.
6. Fechas en UTC (`timestamptz`).
