# API REST de referencia

> Contrato **obligatorio** para este proyecto. Rutas, nombres de campos, códigos HTTP y formato de errores se respetan tal cual. No inventar endpoints nuevos sin acordarlo con el equipo.

## Convenciones

- Prefijo `/api`. JSON con `Content-Type: application/json`.
- IDs enteros. Fechas en ISO 8601 con zona (UTC), ej. `2026-10-29T14:30:00Z`.
- **Importes en centavos enteros.** `650000` = $ 6.500,00. Los campos terminan en `Centavos`.
- Cantidades: enteros positivos. El stock puede ser cero.
- Listados: `{ "datos": [...] }`. Parámetro `q` opcional para buscar.
- Éxito sin contenido: `204 No Content` (sin JSON).

## Contrato común y permisos

- Todo requiere sesión **excepto** `POST /api/sesion`.
- `/api/usuarios` y `/api/usuarios/:id`: **solo administrador** (verificado en el servidor). El resto: cualquier usuario activo.
- `PATCH` acepta objeto parcial: lo omitido conserva su valor. `null` solo en campos opcionales (teléfono, correo, observación). Se valida el **objeto resultante**, no solo lo enviado.
- `422` para campos desconocidos, de solo lectura o de tipo incorrecto. El servidor asigna `id`, `usuarioId` (de la sesión), número de comprobante y fecha de ventas y movimientos. **Nunca** se acepta stock directo ni totales calculados por el cliente.
- En creación, todos los campos de los ejemplos son obligatorios salvo los opcionales. `clienteId: null` = consumidor final. `observacion`, `telefono`, `correo` pueden omitirse o ser `null`, pero el cliente debe tener al menos un contacto.
- Textos obligatorios no pueden quedar vacíos tras `trim()`. Importes/cantidades: enteros dentro de `Number.MAX_SAFE_INTEGER` (incluidas sumas y multiplicaciones). Sin decimales en centavos.
- Búsqueda `q`: no distingue mayúsculas ni acentos; vacía = todo. El `acceso` del usuario se normaliza (trim + minúsculas). El código de producto es único sin distinguir mayúsculas.
- Sin paginación. Orden: productos, clientes y usuarios por nombre e id; ventas y movimientos por fecha e id **descendentes**. `activo=true|false`; si se omite, ambos.
- La interfaz muestra pesos y convierte a centavos antes de llamar a la API. Las fechas ingresadas se convierten de zona local a ISO con zona.
- `404` para cualquier id referenciado que no exista. `409` para acceso/código duplicado y conflictos de stock o saldo. `422` para el resto de validaciones. Las creaciones devuelven header `Location` cuando existe ruta individual.

## Formato de errores

```json
{
  "error": {
    "codigo": "STOCK_INSUFICIENTE",
    "mensaje": "No hay stock suficiente para Café molido 250 g.",
    "detalles": { "productoId": 1, "disponible": 3, "solicitado": 5 }
  }
}
```

| Estado | Uso |
| --- | --- |
| `400` | JSON inválido o solicitud mal formada. |
| `401` | Falta sesión válida o credenciales incorrectas. |
| `403` | Sin permiso para la operación. |
| `404` | El recurso no existe. |
| `409` | Conflicto: stock insuficiente, código/acceso duplicado, pago mayor al saldo, producto inactivo. |
| `422` | Datos bien formados que no cumplen las validaciones. |
| `500` | Error inesperado. **No exponer detalles internos.** |

Códigos de error usados en el proyecto (mantener consistentes, definidos en `src/lib/errors.js`):
`JSON_INVALIDO`, `NO_AUTENTICADO`, `CREDENCIALES_INVALIDAS`, `PROHIBIDO`, `NO_ENCONTRADO`, `VALIDACION`, `CODIGO_DUPLICADO`, `ACCESO_DUPLICADO`, `STOCK_INSUFICIENTE`, `PRODUCTO_INACTIVO`, `PAGO_SUPERA_SALDO`, `ULTIMO_ADMINISTRADOR`, `ERROR_INTERNO`.

---

## Sesión y usuarios

Cookie de sesión `HttpOnly`, `Secure` en producción, `SameSite=Lax`. HTTPS en producción y comprobación estricta de origen (header `Origin`) en métodos que modifican datos. La sesión expira, se invalida al cerrar sesión y se renueva al iniciar sesión. En **cada** solicitud el servidor verifica que el usuario siga activo.

El primer administrador se crea con un **comando de inicialización** (`npm run db:seed`), nunca con un endpoint público. Su contraseña viene del `.env`, fuera del repo. No se puede desactivar ni quitar el perfil al **último administrador activo** (`409`). Las respuestas de usuario **nunca** incluyen la contraseña ni su hash.

### `POST /api/sesion` — iniciar sesión
```json
{ "acceso": "ana@ejemplo.com", "contrasena": "contraseña-de-ejemplo" }
```
`200` crea la sesión y setea la cookie:
```json
{ "usuario": { "id": 1, "nombre": "Ana Martínez", "acceso": "ana@ejemplo.com", "administrador": true, "activo": true } }
```
Credenciales inválidas o usuario inactivo → `401`.

### `GET /api/sesion` — sesión actual
`200` con `{ usuario }` o `401`.

### `DELETE /api/sesion` — cerrar sesión
Invalida la sesión → `204`.

### `GET /api/usuarios?q=lucia` (admin)
Busca por nombre y acceso.
```json
{ "datos": [ { "id": 2, "nombre": "Lucía Pérez", "acceso": "lucia@ejemplo.com", "administrador": false, "activo": true } ] }
```

### `GET /api/usuarios/:id` (admin)
`200` o `404`.

### `POST /api/usuarios` (admin)
```json
{ "nombre": "Lucía Pérez", "acceso": "lucia@ejemplo.com", "contrasena": "contraseña-de-ejemplo", "administrador": false, "activo": true }
```
`201` con el usuario sin contraseña. Acceso duplicado → `409`. Contraseña con hash seguro (bcrypt).

### `PATCH /api/usuarios/:id` (admin)
Editables: `nombre`, `acceso`, `administrador`, `activo`. El cambio de contraseña queda fuera de alcance.
```json
{ "nombre": "Lucía Pérez", "activo": false }
```
`200`. Desactivar impide el acceso posterior **aunque tenga una sesión abierta**.

---

## Productos

Campos: `id`, `codigo`, `nombre`, `precioVentaCentavos`, `stockActual`, `activo`. Código único, precio > 0. El stock **solo** cambia por movimientos o ventas.

### `GET /api/productos?q=cafe&activo=true`
Busca por código y nombre.
```json
{ "datos": [ { "id": 1, "codigo": "CAF-001", "nombre": "Café molido 250 g", "precioVentaCentavos": 650000, "stockActual": 24, "activo": true } ] }
```

### `GET /api/productos/:id`
`200` o `404`.

### `POST /api/productos`
```json
{ "codigo": "CAF-001", "nombre": "Café molido 250 g", "precioVentaCentavos": 650000, "stockInicial": 24, "activo": true }
```
`201`. En **una transacción** crea el producto y, si `stockInicial > 0`, un movimiento `ENTRADA` con origen `INICIAL`. `stockInicial` no puede ser negativo.

### `PATCH /api/productos/:id`
Editables **solo**: `codigo`, `nombre`, `precioVentaCentavos`, `activo`. (`stockInicial` solo en creación.)
```json
{ "nombre": "Café molido 250 g", "precioVentaCentavos": 690000, "activo": true }
```
`200`. Baja lógica con `activo: false`. No altera ventas anteriores.

---

## Movimientos de stock

### `GET /api/movimientos-stock?productoId=1`
`productoId` opcional.
```json
{
  "datos": [
    {
      "id": 15, "fecha": "2026-10-29T14:30:00Z", "productoId": 1, "productoNombre": "Café molido 250 g",
      "detalleVentaId": 81, "tipo": "SALIDA", "cantidad": 2, "motivo": "Venta #42",
      "origen": "VENTA", "ventaId": 42, "usuarioId": 1
    }
  ]
}
```
- `origen`: `INICIAL` (solo lo crea el alta de producto), `MANUAL` (solo lo crea esta API) o `VENTA` (solo lo crea la confirmación de venta).
- `ventaId` se obtiene a través de `detalleVentaId` (no se guarda duplicado). Es `null` en `MANUAL` e `INICIAL`.
- `productoNombre` sale del catálogo.
- Los ajustes manuales también se permiten sobre productos inactivos.

### `POST /api/movimientos-stock`
```json
{ "productoId": 1, "tipo": "ENTRADA", "cantidad": 10, "motivo": "Ingreso de mercadería" }
```
`201`:
```json
{
  "movimiento": { "id": 16, "productoId": 1, "productoNombre": "Café molido 250 g", "detalleVentaId": null, "tipo": "ENTRADA", "cantidad": 10, "motivo": "Ingreso de mercadería", "origen": "MANUAL", "ventaId": null, "usuarioId": 1, "fecha": "2026-10-29T15:00:00Z" },
  "stockActual": 34
}
```
`tipo`: `ENTRADA` | `SALIDA`. Cantidad > 0, motivo obligatorio. Salida mayor al stock → `409` sin crear nada. Movimiento + actualización de stock en **la misma transacción**.

---

## Clientes

### `GET /api/clientes?q=gonzalez`
Busca por nombre y documento. Incluye `saldoCentavos` **calculado** (solo lectura).
```json
{ "datos": [ { "id": 7, "nombre": "María González", "documento": "28.456.123", "telefono": null, "correo": "maria@ejemplo.com", "saldoCentavos": 2720000 } ] }
```

### `GET /api/clientes/:id`
`200` (con `saldoCentavos`) o `404`.

### `POST /api/clientes`
```json
{ "nombre": "María González", "documento": "28.456.123", "telefono": null, "correo": "maria@ejemplo.com" }
```
`201` con `saldoCentavos: 0`. Requiere nombre, documento y al menos un contacto. El cliente nuevo se puede seleccionar en una venta en curso **sin reiniciarla**.

### `PATCH /api/clientes/:id`
Editables: `nombre`, `documento`, `telefono`, `correo`. Debe quedar al menos un contacto. No modifica comprobantes anteriores.

---

## Ventas y comprobantes

`formaPago`: `CONTADO` | `TARJETA` | `CUENTA_CORRIENTE`. Consumidor final → `clienteId: null`. Cuenta corriente exige cliente registrado.

### `GET /api/ventas`
```json
{ "datos": [ { "id": 42, "numero": 42, "clienteId": 7, "fecha": "2026-10-29T14:30:00Z", "clienteNombre": "María González", "formaPago": "CUENTA_CORRIENTE", "totalCentavos": 1720000 } ] }
```

### `POST /api/ventas`
```json
{
  "clienteId": 7,
  "formaPago": "CUENTA_CORRIENTE",
  "productos": [ { "productoId": 1, "cantidad": 2 }, { "productoId": 2, "cantidad": 1 } ]
}
```
El servidor:
1. **Agrupa** productos repetidos sumando cantidades (un detalle por producto).
2. Lee precios **vigentes** de la BD (ignora cualquier precio/total del navegador).
3. Verifica que existan (`404`), estén activos (`409`) y haya stock (`409`).
4. En **una única transacción**: guarda venta + detalles (con copias de nombre/documento del cliente y descripción/precio del producto), descuenta stock con **UPDATE condicional** (`... WHERE stock_actual >= cantidad`) y crea un movimiento `SALIDA`/`VENTA` por detalle. Si algo falla, rollback total.
5. La deuda **es** la venta en cuenta corriente: no se inserta otra fila de deuda.
6. Número de comprobante único bajo concurrencia (secuencia / identity de la BD). **Prohibido** `MAX(numero) + 1`.

`201` con el comprobante completo (mismo formato que `GET /api/ventas/:id`).
Errores: sin productos o cantidades inválidas → `422`; producto inexistente → `404`; inactivo o sin stock → `409`; cuenta corriente sin cliente → `422`.

### `GET /api/ventas/:id`
```json
{
  "id": 42, "numero": 42, "fecha": "2026-10-29T14:30:00Z", "usuarioId": 1,
  "clienteId": 7, "clienteNombre": "María González", "clienteDocumento": "28.456.123",
  "formaPago": "CUENTA_CORRIENTE",
  "productos": [
    { "productoId": 1, "descripcion": "Café molido 250 g", "cantidad": 2, "precioUnitarioCentavos": 650000, "subtotalCentavos": 1300000 },
    { "productoId": 2, "descripcion": "Té en hebras 100 g", "cantidad": 1, "precioUnitarioCentavos": 420000, "subtotalCentavos": 420000 }
  ],
  "totalCentavos": 1720000
}
```
Consumidor final: `clienteId: null`, `clienteNombre: "Consumidor final"`, `clienteDocumento: null`. Los datos salen de las copias históricas, **nunca** del catálogo actual.

---

## Cuenta corriente y pagos

Saldo = Σ ventas `CUENTA_CORRIENTE` del cliente − Σ pagos. Contado y tarjeta no cuentan.

### `GET /api/clientes/:id/cuenta-corriente`
Movimientos por fecha descendente; importes siempre positivos, `tipo` indica el sentido.
```json
{
  "clienteId": 7,
  "saldoCentavos": 2720000,
  "movimientos": [
    { "tipo": "VENTA", "fecha": "2026-10-29T14:30:00Z", "ventaId": 42, "numeroComprobante": 42, "importeCentavos": 1720000 },
    { "tipo": "PAGO", "fecha": "2026-10-25T12:00:00Z", "pagoId": 8, "importeCentavos": 500000, "observacion": "Pago parcial" }
  ]
}
```
Cliente inexistente → `404`. Sin movimientos → saldo 0 y arreglo vacío.

### `POST /api/clientes/:id/pagos`
```json
{ "fecha": "2026-10-29T15:00:00Z", "importeCentavos": 500000, "observacion": "Pago parcial" }
```
`201`:
```json
{
  "pago": { "id": 9, "clienteId": 7, "usuarioId": 1, "fecha": "2026-10-29T15:00:00Z", "importeCentavos": 500000, "observacion": "Pago parcial" },
  "saldoCentavos": 2220000
}
```
Importe > 0 y ≤ saldo (si supera → `409`, no se registra). Fecha válida obligatoria y **no futura**. Observación opcional. Verificación de saldo + registro en transacción **serializada por cliente** (ej. `SELECT ... FROM clientes WHERE id = $1 FOR UPDATE`). No procesa tarjetas ni transferencias.

---

## Límites

- Sin borrado físico ni edición de ventas, pagos o movimientos confirmados.
- Búsquedas, borrador de venta, subtotales visuales e impresión **no** requieren endpoints extra. El servidor recalcula y valida al confirmar.
- La interfaz deshabilita el botón mientras confirma una venta o pago.
- "Stock bajo" usa un umbral ilustrativo de **3 unidades** (solo visual).

## Resumen de rutas

| Método | Ruta | Función | Archivo |
| --- | --- | --- | --- |
| `POST` `GET` `DELETE` | `/api/sesion` | Iniciar / consultar / cerrar sesión | `src/app/api/sesion/route.js` |
| `GET` `POST` | `/api/usuarios` | Listar y crear (admin) | `src/app/api/usuarios/route.js` |
| `GET` `PATCH` | `/api/usuarios/:id` | Consultar y modificar (admin) | `src/app/api/usuarios/[id]/route.js` |
| `GET` `POST` | `/api/productos` | Listar y crear | `src/app/api/productos/route.js` |
| `GET` `PATCH` | `/api/productos/:id` | Consultar y modificar | `src/app/api/productos/[id]/route.js` |
| `GET` `POST` | `/api/movimientos-stock` | Consultar y registrar | `src/app/api/movimientos-stock/route.js` |
| `GET` `POST` | `/api/clientes` | Listar y crear | `src/app/api/clientes/route.js` |
| `GET` `PATCH` | `/api/clientes/:id` | Consultar y modificar | `src/app/api/clientes/[id]/route.js` |
| `GET` | `/api/clientes/:id/cuenta-corriente` | Saldo y movimientos | `src/app/api/clientes/[id]/cuenta-corriente/route.js` |
| `POST` | `/api/clientes/:id/pagos` | Registrar pago | `src/app/api/clientes/[id]/pagos/route.js` |
| `GET` `POST` | `/api/ventas` | Listar y registrar | `src/app/api/ventas/route.js` |
| `GET` | `/api/ventas/:id` | Consultar comprobante | `src/app/api/ventas/[id]/route.js` |
