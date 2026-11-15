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
| `/ventas`, `/ventas/nueva`, `/ventas/[id]` | Facturas | Ambos | Pendiente |
| `/productos`, `/productos/[id]`, `/productos/categorias` | Catálogo, ficha, categorías | Ambos (edición admin) | Pendiente |
| `/clientes`, `/clientes/[id]`, `/clientes/saldos` | Clientes y cuenta corriente | Ambos | Pendiente |

Para el vendedor, el panel lateral no muestra Usuarios. Si entra igual por URL, ve un aviso, y la API le responde `403`.
