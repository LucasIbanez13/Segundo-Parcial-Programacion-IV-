# Pantallas y diseño (mockup "mostrador")

> Las pantallas siguen el mockup de referencia. El mockup completo está en [`mockup/mockup.html`](mockup/mockup.html) (abrir en el navegador). El mockup usa datos ficticios y **no** reemplaza validaciones ni persistencia.
>
> **Secciones del menú lateral (solo estas 4):** Ventas · Productos y stock · Clientes · Usuarios.
> Las secciones "Enunciado", "API REST" y "Base de datos" del mockup son documentación: **no van en la app**.

## Layout general

- **Sidebar** fija de 235px (fondo `#1d3930`): logo cuadrado "M" (`#d4ed91`) + "mostrador" / "GESTIÓN COMERCIAL", etiqueta "ESPACIO DE TRABAJO", los 4 botones de navegación y abajo el texto "Un lugar para organizar tu comercio, todos los días.". Ítem activo con fondo `#36584b`.
- **Header** (67px, fondo `#fafbf7`): a la derecha avatar con iniciales, nombre del usuario, rol ("Administrador/a" u "Operador/a") y link "Cerrar sesión". Se oculta en `/login`.
- **Encabezado de página** (`PageHeader`): breadcrumb en mayúsculas (ej. `VENTAS / NUEVA VENTA`), título grande con fuente serif (Georgia), subtítulo gris y botón de acción a la derecha.
- **Responsive**: < 850px la sidebar pasa a barra horizontal arriba con scroll; < 550px los formularios y las tarjetas pasan a una columna.

## Rutas de la app

| Ruta | Pantalla | Archivo |
| --- | --- | --- |
| `/login` | Iniciar sesión | `src/app/login/page.jsx` |
| `/ventas/nueva` | Crear una venta | `src/app/(dashboard)/ventas/nueva/page.jsx` |
| `/ventas` | Ventas registradas | `src/app/(dashboard)/ventas/page.jsx` |
| `/ventas/[id]` | Detalle de venta (comprobante) | `src/app/(dashboard)/ventas/[id]/page.jsx` |
| `/productos` | Productos y stock | `src/app/(dashboard)/productos/page.jsx` |
| `/productos/nuevo` | Nuevo producto | `src/app/(dashboard)/productos/nuevo/page.jsx` |
| `/productos/[id]/editar` | Editar producto | `src/app/(dashboard)/productos/[id]/editar/page.jsx` |
| `/productos/movimientos` | Movimientos de stock | `src/app/(dashboard)/productos/movimientos/page.jsx` |
| `/productos/movimientos/nuevo` | Registrar movimiento | `src/app/(dashboard)/productos/movimientos/nuevo/page.jsx` |
| `/clientes` | Clientes | `src/app/(dashboard)/clientes/page.jsx` |
| `/clientes/nuevo` | Nuevo cliente | `src/app/(dashboard)/clientes/nuevo/page.jsx` |
| `/clientes/[id]` | Cuenta corriente | `src/app/(dashboard)/clientes/[id]/page.jsx` |
| `/clientes/[id]/editar` | Editar cliente | `src/app/(dashboard)/clientes/[id]/editar/page.jsx` |
| `/clientes/[id]/pagos/nuevo` | Registrar pago | `src/app/(dashboard)/clientes/[id]/pagos/nuevo/page.jsx` |
| `/usuarios` | Usuarios (solo admin) | `src/app/(dashboard)/usuarios/page.jsx` |
| `/usuarios/nuevo` | Nuevo usuario (solo admin) | `src/app/(dashboard)/usuarios/nuevo/page.jsx` |
| `/usuarios/[id]/editar` | Editar usuario (solo admin) | `src/app/(dashboard)/usuarios/[id]/editar/page.jsx` |

`/` redirige a `/ventas/nueva` si hay sesión o a `/login` si no.

## Detalle de cada pantalla

### Iniciar sesión — `ACCESO`
Tarjeta "Acceso al comercio" con *Correo o nombre de acceso* y *Contraseña*, botón "Ingresar". Mensaje de error claro si las credenciales son inválidas o el usuario está inactivo.

### Crear una venta — `VENTAS / NUEVA VENTA`
Dos columnas: izquierda (Cliente + Productos) y derecha (Resumen).
- **Panel Cliente**: select *Cliente* (primera opción "Consumidor final" + clientes registrados) y *Documento* de solo lectura. Link "+ Nuevo cliente" que abre el alta **sin perder la venta en curso** (modal o volver con el cliente ya seleccionado).
- **Panel Productos**: badge "N artículos", select *Agregar producto* (`CÓDIGO · Nombre · $ precio`, **solo activos**) + botón "Agregar". Tabla: Producto (nombre + `código · Stock: N`), Cantidad (input entero, mín. 1, máx. stock), Precio, Subtotal, "Quitar". Vacía: "Agregá al menos un producto para preparar la venta.".
- **Resumen de venta** ("Comprobante interno"): Productos (N unidades), Subtotal, **Total**. *Forma de pago* con radios: Contado, Tarjeta, Cuenta corriente (deshabilitada si es consumidor final, con nota "Seleccioná un cliente registrado para usar cuenta corriente."). Error en rojo (`.form-error`). Botón "Confirmar venta →" (deshabilitado si no hay productos o mientras confirma). Nota: "Al confirmar se verifican y descuentan las existencias.".
- Botón superior: "Ver ventas registradas →".

### Ventas registradas — `VENTAS / HISTORIAL`
3 tarjetas: Ventas de hoy ($ y cantidad de operaciones), En cuenta corriente (hoy), Último comprobante. Tabla "Comprobantes recientes": Número (`#00042`), Fecha, Cliente, Pago (badge: Cuenta corriente = warn, Contado = verde, Tarjeta = neutral), Total, "Ver detalle". Botón "+ Nueva venta".

### Detalle de venta — `VENTAS / COMPROBANTE`
Panel "Comprobante interno #00042" con "No válido como comprobante fiscal" y badge "Registrada". Datos: Fecha, Forma de pago, Cliente, Documento. Tabla: Producto, Cantidad, Precio unitario, Subtotal. Subtotal y Total. Aside: "El comprobante conserva los datos registrados en la operación…". Botones "← Volver a ventas" e "Imprimir comprobante" (opcional, `window.print()`).

### Productos y stock — `CATÁLOGO / EXISTENCIAS`
3 tarjetas: Productos activos, Con stock bajo (≤ 3), Movimientos recientes. Toolbar: buscador "Nombre o código", "Registrar movimiento", "Ver movimientos". Tabla: Producto, Código, Precio, Stock, Estado (badge Activo / Stock bajo / Inactivo), "Editar". Botón "+ Nuevo producto".

### Nuevo / Editar producto — `PRODUCTOS / ALTA | EDICIÓN`
Campos: Código, Nombre, Precio de venta ($), Stock inicial (solo en alta; en edición "Stock actual" de solo lectura), Estado (Activo/Inactivo). Aside de ayuda. En edición: "Para modificar las existencias, registrá una entrada o salida de stock.".

### Movimientos de stock — `PRODUCTOS / HISTORIAL`
Tabla: Fecha, Producto, Origen (`Venta #00042` / `Manual` / `Inicial`), Motivo, Cantidad (`+20` / `−2`).

### Registrar movimiento — `PRODUCTOS / STOCK`
Producto (select con stock actual, incluye inactivos), Tipo (Entrada/Salida), Cantidad (entero ≥ 1), Motivo (textarea obligatorio). Aviso: "Una salida no puede dejar el stock en negativo.".

### Clientes — `PERSONAS / CUENTAS CORRIENTES`
Buscador "Nombre o documento". Tabla: Cliente, Documento, Contacto, Saldo adeudado, "Ver cuenta →", "Editar". Botón "+ Nuevo cliente".

### Nuevo / Editar cliente — `CLIENTES / ALTA | EDICIÓN`
Nombre y apellido o razón social, Documento o identificación, Teléfono (opcional), Correo (opcional). Nota: "Completá al menos un teléfono o un correo electrónico.".

### Cuenta corriente — `CLIENTES / CUENTA CORRIENTE`
Título = nombre del cliente, subtítulo = documento · contacto. Panel "Movimientos de la cuenta": Fecha, Concepto (`Venta #00042` / `Pago recibido`), Importe (`+ $` / `− $`). Panel "Saldo adeudado" (número grande) + botón "Registrar pago" (deshabilitado si saldo = 0). Sin movimientos: "Sin movimientos en cuenta corriente. Las ventas de contado o tarjeta no generan deuda.".

### Registrar pago — `CLIENTES / CUENTA CORRIENTE / PAGO`
Fecha y hora (no futura), Importe ($, máx. = saldo), Observación (opcional). Aside con saldo actual y "El pago no puede superar el saldo adeudado.".

### Usuarios — `CONFIGURACIÓN / ACCESOS` (solo admin)
Tabla: Usuario, Acceso, Perfil (Administrador/a / Operador/a), Estado, "Editar". Botón "+ Nuevo usuario".

### Nuevo / Editar usuario
Alta: Nombre y apellido, Correo o nombre de acceso, Contraseña, Confirmar contraseña, Perfil, Estado. Edición: sin contraseña ("El cambio de contraseña queda fuera de esta pantalla.").

## Tokens de diseño (ya cargados en `src/app/globals.css`)

| Token Tailwind | Color | Uso |
| --- | --- | --- |
| `sidebar` | `#1d3930` | fondo sidebar |
| `sidebar-active` | `#36584b` | ítem activo / hover |
| `accent` | `#d4ed91` | logo "M" |
| `primary` | `#254d3c` | botón principal (hover `#34634d`) |
| `background` | `#f2f3ed` | fondo general |
| `topbar` | `#fafbf7` | header |
| `surface` | `#ffffff` | paneles / tarjetas |
| `border` | `#e1e7df` | bordes |
| `ink` | `#23332d` | texto principal |
| `heading` | `#20372d` | títulos |
| `muted` | `#758278` | textos secundarios |
| `help` | `#eaf0e6` | cajas de ayuda (aside) |
| `focus` | `#d8a448` | outline de foco |
| `danger` | `#9a3527` | errores |
| badge ok | `#eaf4e5` / `#4f7849` | Activo, Contado |
| badge warn | `#fff2d9` / `#96661d` | Stock bajo, Cuenta corriente |
| badge neutral | `#eff1ec` / `#66776b` | Inactivo, Tarjeta |

Tipografía: sans (`Avenir Next, Avenir, Segoe UI, sans-serif`) para todo; **Georgia (serif)** para títulos `h1` y números grandes de tarjetas. Bordes redondeados 7–10px. Tablas con encabezados en mayúsculas, 10px, gris.

Formato de moneda: `Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0, maximumFractionDigits: 2 })` sobre `centavos / 100` → `$ 17.200`. Número de comprobante: 5 dígitos con ceros (`#00042`). Fechas: `29 oct 2026`.
