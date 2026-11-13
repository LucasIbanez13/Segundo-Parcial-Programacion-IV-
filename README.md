# mostrador — Sistema de gestión comercial

2º Parcial · Programación IV

Sistema para un comercio minorista: factura ventas, controla las existencias del catálogo y lleva la cuenta corriente de los clientes, con usuarios por rol (administrador y vendedor) y un tablero de indicadores.

- **Integrantes:** _(completar)_
- **URL pública:** _(completar al publicar en Vercel)_

## Tecnologías

| Capa | Tecnología |
| --- | --- |
| Lenguaje | TypeScript |
| Framework | Next.js 15 (App Router) + React 19 |
| API | REST con Route Handlers |
| Interfaz | shadcn/ui + Tailwind CSS 4 |
| Base de datos | SQLite en desarrollo · libSQL (Turso) en producción |
| Acceso a datos | Drizzle ORM + migraciones con drizzle-kit |
| Validación | Zod (esquemas compartidos entre cliente y servidor) |
| Autenticación | Sesión propia en cookie `httpOnly` firmada (HMAC-SHA256) + bcrypt |
| Hosting | Vercel |

## Puesta en marcha local

Requisitos: Node.js 22 y pnpm (`corepack enable pnpm`, o `npx pnpm@9` si no se puede activar).

```bash
pnpm install
cp .env.example .env
pnpm run db:migrate
pnpm run db:seed
pnpm run dev
```

Abrir http://localhost:3000.

## Variables de entorno

Ver [`.env.example`](.env.example).

| Variable | Para qué |
| --- | --- |
| `DATABASE_URL` | `file:./local.db` en desarrollo; `libsql://...turso.io` en producción |
| `DATABASE_AUTH_TOKEN` | Token de Turso (solo producción) |
| `SESSION_SECRET` | Secreto para firmar la cookie de sesión (≥ 32 caracteres) |
| `SEED_*` | Nombre, email y contraseña de los usuarios de prueba que crea el seed |

## Usuarios de prueba

| Rol | Email | Contraseña |
| --- | --- | --- |
| Administrador | `admin@mostrador.test` | `admin1234` |
| Vendedor | `vendedor@mostrador.test` | `vendedor1234` |

(Son los valores de `.env.example` para desarrollo; en producción se definen en las variables de Vercel.)

## Arquitectura

```
src/
├── app/
│   ├── login/                 # única página pública
│   ├── (app)/                 # páginas privadas (panel lateral + barra superior)
│   │   ├── perfil/            # cambio de la propia contraseña
│   │   └── usuarios/          # administración (solo admin) + acciones.ts (Server Actions)
│   └── api/                   # API REST (sección 11): auth/, usuarios/ ...
├── services/                  # reglas de negocio: validar → verificar rol → reglas → resultado
├── repositories/              # consultas Drizzle, sin reglas
├── db/                        # esquema, conexión y seed
├── lib/                       # errores (ApiError), esquemas Zod, sesión, envoltorios ruta()/accion(), formatos
├── components/                # ui/ (shadcn), base/ (primitivas), comunes/, layout/ y por módulo
└── middleware.ts              # proxy: sin cookie firmada → /login
```

## Funcionalidades

| Requerimiento | Estado |
| --- | --- |
| RF-U1 a RF-U5 Usuarios y acceso | ✅ Implementado |
| RF-P1 a RF-P7 Productos y existencias | Pendiente |
| RF-C1 a RF-C7 Clientes y cuenta corriente | Pendiente |
| RF-V1 a RF-V9 Ventas | Pendiente |
| RF-T1 a RF-T3 Tablero | Pendiente |

La documentación completa para el equipo está en [`docs/`](docs/README.md).
