# mostrador — Sistema de ventas y gestión comercial

Segundo Parcial · Programación IV

Aplicación web para gestionar las ventas de un comercio, su catálogo de productos, las existencias y las cuentas corrientes de sus clientes.

## Tecnologías

- **Next.js 15** (App Router) + **React 19** — JavaScript
- **Tailwind CSS 4** — estilos
- **PostgreSQL** + **Drizzle ORM** — base de datos persistente
- **bcryptjs** — hash de contraseñas
- **zod** — validaciones
- Sesión con tabla `sesiones` en la BD + cookie HttpOnly

## Documentación para el equipo (y la IA)

Toda la especificación está en [`docs/`](docs/README.md): enunciado, API REST, base de datos, pantallas, reglas y checklist.
Las IAs (Claude Code, Codex, Copilot, Cursor) leen automáticamente [`AGENTS.md`](AGENTS.md) / [`CLAUDE.md`](CLAUDE.md), que las obligan a respetar esa documentación.

## Estructura del proyecto

El proyecto separa **interfaz**, **lógica de aplicación** y **acceso a datos**:

```
src/
├── app/                      # INTERFAZ (páginas) + API REST
│   ├── login/                # Iniciar sesión
│   ├── (dashboard)/          # Secciones protegidas (sidebar + header)
│   │   ├── ventas/           # Listado, nueva venta, detalle de comprobante
│   │   ├── productos/        # Catálogo, alta/edición, movimientos de stock
│   │   ├── clientes/         # Clientes, cuenta corriente, pagos
│   │   └── usuarios/         # Administración de usuarios (solo admin)
│   └── api/                  # Endpoints REST (ver docs/02-api-rest.md)
│       ├── sesion/           # login, sesión actual, logout
│       ├── ventas/
│       ├── productos/
│       ├── movimientos-stock/
│       ├── clientes/         # + /[id]/cuenta-corriente y /[id]/pagos
│       └── usuarios/
├── components/               # Componentes de React
│   ├── layout/               # Sidebar, Header, PageHeader
│   ├── ui/                   # Button, Card, Input, Table, Badge, Alert...
│   ├── auth/  ventas/  productos/  clientes/  usuarios/
├── services/                 # LÓGICA DE APLICACIÓN (reglas de negocio)
├── repositories/             # ACCESO A DATOS (consultas con Drizzle)
├── db/                       # Conexión, esquema de tablas y seed
│   └── schema/
├── lib/                      # auth (sesión, contraseñas, permisos), validaciones, utilidades
└── middleware.js             # Protección de rutas
```

Flujo de una petición: `página / componente` → `app/api/...` → `services/` → `repositories/` → `db/`.

## Instalación y ejecución local

```bash
npm install
cp .env.example .env      # completar DATABASE_URL y ADMIN_*
npm run db:push           # crea las tablas en la base de datos
npm run db:seed           # crea el primer administrador y datos de ejemplo
npm run dev               # http://localhost:3000
```

## Variables de entorno

| Variable         | Descripción                                   |
| ---------------- | --------------------------------------------- |
| `DATABASE_URL`     | Cadena de conexión a PostgreSQL               |
| `ADMIN_NOMBRE`     | Nombre del primer administrador (seed)        |
| `ADMIN_ACCESO`     | Correo / acceso del primer administrador      |
| `ADMIN_CONTRASENA` | Contraseña del primer administrador (seed)    |

> Las credenciales reales **no** se suben al repositorio (`.env` está en `.gitignore`).

## Aplicación publicada

_Pendiente: agregar enlace._

## Datos de acceso para la evaluación

_Pendiente._

| Rol            | Usuario | Contraseña |
| -------------- | ------- | ---------- |
| Administrador  |         |            |
| Operador       |         |            |

## Funcionalidades

- [ ] Inicio y cierre de sesión
- [ ] Administración de usuarios (solo administrador)
- [ ] Productos: alta, consulta, edición, búsqueda, activo/inactivo
- [ ] Movimientos de stock manuales y por ventas
- [ ] Clientes: alta, consulta, edición, búsqueda
- [ ] Cuenta corriente: saldo, ventas, pagos e historial
- [ ] Ventas: carrito, verificación de stock, comprobante, descuento de stock y deuda
- [ ] Listado de ventas y detalle del comprobante

## Integrantes

- 
- 
- 
