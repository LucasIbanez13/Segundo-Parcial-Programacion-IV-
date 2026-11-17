# Pantallas y diseño

> Las pantallas y rutas salen de las **secciones 4 y 8 del enunciado**. Las pantallas de referencia de la cátedra están en [`mockup/pantallas.html`](mockup/pantallas.html) (abrir en el navegador). Son **solo referencia de contenido y flujos**: el diseño visual es propio, con shadcn/ui + Tailwind, y **no** se copia el formato de esas pantallas.

## Identidad visual propia

- **Tokens** en `src/app/globals.css` (variables de shadcn/ui en `oklch`): azul tinta como `primary`, ámbar como acento del panel lateral (`sidebar-primary`) y neutros cálidos de fondo. También `exito`, `advertencia` y `destructive` para estados. Tiene modo oscuro (`.dark`).
- **Tipografía:** Geist (sans) y Geist Mono, cargadas con `next/font`.
- **Componentes:** solo shadcn/ui (`src/components/ui/`) más las primitivas propias (`src/components/base/primitivas.tsx`: `Pila`, `Fila`, `Grilla`, `Texto`, `Titulo`).
- **Comunes** (`src/components/comunes/`): `EncabezadoPagina`, `EstadoVacio`, `EstadoError`, `CargandoTabla`, `ConfirmarAccion`, `CampoFormulario`, `Insignia` / `InsigniaActivo`, `Paginador`.
- **Las páginas no llevan etiquetas HTML sueltas** (sección 10.6): se arman con esas piezas.
- **Formatos** solo desde `src/lib/format.ts`: moneda `$ 12.345,50`, fecha `dd/mm/aaaa` y hora de Argentina.

## Estructura

- `src/app/(app)/layout.tsx`: panel lateral (Sidebar de shadcn con el módulo activo resaltado, que en el teléfono se colapsa en un menú) y barra superior con el usuario conectado. El menú del usuario tiene "Mi perfil y contraseña" y "Cerrar sesión".
- `/login` queda fuera de ese layout.

## Rutas

| Ruta | Pantalla | Rol | Estado |
| --- | --- | --- | --- |
| `/login` | Iniciar sesión | Público | ✅ |
| `/perfil` | Mis datos y cambio de contraseña (RF-U5) | Ambos | ✅ |
| `/usuarios` | Listado con búsqueda, filtro de estado, paginado, restablecer contraseña y activar/desactivar | Admin | ✅ |
| `/usuarios/nuevo` | Alta de usuario | Admin | ✅ |
| `/usuarios/[id]` | Edición de usuario | Admin | ✅ |
| `/` | Tablero (RF-T) | Ambos | Pendiente |
| `/ventas` | Facturas con búsqueda, fechas, cliente, forma de pago, vendedor, estado y paginado (RF-V8) | Ambos | ✅ |
| `/ventas/nueva` | Nueva venta: ítems, comprador, forma de pago y teclado (F2, F4, F8, F9) (RF-V1 a RF-V6) | Ambos | ✅ |
| `/ventas/[id]` | Comprobante imprimible (RF-V7); el admin anula con motivo (RF-V9) | Ambos (anular: admin) | ✅ |
| `/productos` | Catálogo con búsqueda, filtro por categoría, bajo mínimo, estado (admin) y paginado (RF-P1) | Ambos | ✅ |
| `/productos/nuevo`, `/productos/[id]/editar` | Alta y edición de producto, con stock inicial como ingreso (RF-P2) | Admin | ✅ |
| `/productos/[id]` | Ficha con movimientos (RF-P6); el admin registra ingresos y egresos (RF-P4, RF-P5) y da de baja (RF-P3) | Ambos (acciones admin) | ✅ |
| `/productos/movimientos` | Movimientos de stock de todos los productos, filtros por tipo y fechas (RF-P6) | Ambos | ✅ |
| `/productos/categorias` | Categorías: alta, renombrar y activar/desactivar (RF-P7) | Ambos (edición admin) | ✅ |
| `/clientes` | Listado con búsqueda, estado, "Solo con deuda" y total adeudado (RF-C1) | Ambos | ✅ |
| `/clientes/[id]` | Ficha: saldo, límite y disponible; datos y últimas facturas (RF-C3); cuenta corriente (RF-C4); registrar pago, editar y dar de baja (RF-C5, RF-C2, RF-C7) | Ambos | ✅ |
| `/clientes/recibos/[id]` | Recibo numerado e imprimible (RF-C5) | Ambos | ✅ |
| `/clientes/saldos` | Saldos de cuentas corrientes, imprimible (RF-C6) | Ambos | ✅ |

Para el vendedor, el panel lateral no muestra Usuarios. Si entra igual por URL, ve un aviso, y la API le responde `403`.
