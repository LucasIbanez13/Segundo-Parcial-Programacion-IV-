# Celulares el Tucu — Sistema de gestión comercial

2º Parcial · Programación IV

Sistema de gestión para **Celulares el Tucu**, una tienda de celulares y accesorios de San Miguel de Tucumán
(25 de Mayo 300 · Tel. (381) 123-4567). Factura ventas, controla las existencias del catálogo (celulares, fundas
y protectores, cargadores y cables, auriculares y repuestos) y lleva la cuenta corriente de los clientes, con
usuarios por rol (administrador y vendedor) y un tablero de indicadores.

- **Integrantes:** Cuellar, Elías · Ibañez, Lucas · Pastrana, Lucila
- **URL pública:** _(completar al publicar en Vercel)_

## Tecnologías

| Capa | Tecnología |
| --- | --- |
| Lenguaje | TypeScript |
| Framework | Next.js 15 (App Router) + React 19 |
| API | REST con Route Handlers |
| Interfaz | shadcn/ui + Tailwind CSS 4 |
| Gráficos | Chart.js + react-chartjs-2 |
| Base de datos | SQLite en desarrollo · libSQL (Turso) en producción |
| Acceso a datos | Drizzle ORM + migraciones con drizzle-kit |
| Validación | Zod (esquemas compartidos entre cliente y servidor) |
| Autenticación | Sesión propia en cookie `httpOnly` firmada (HMAC-SHA256) + bcrypt |
| Hosting | Vercel |

## Puesta en marcha local

Requisitos: Node.js 22 y pnpm (`corepack enable pnpm`, o `npx pnpm@9` si no se puede activar).

```bash
pnpm install
cp .env.example .env    # en Windows (PowerShell): Copy-Item .env.example .env
pnpm run db:migrate     # crea local.db con las tablas
pnpm run db:seed        # carga los datos de prueba de la tienda
pnpm run dev
```

Abrir http://localhost:3000 e ingresar con uno de los usuarios de prueba.

### Datos de prueba (`pnpm run db:seed`)

El script `src/db/seed.ts` crea todo con **los mismos servicios que usa la aplicación** (sección 10.7), así el
stock, los saldos y la numeración cumplen todas las reglas:

- 2 usuarios (administrador y vendedor), tomados del `.env`.
- 5 categorías con 6 productos cada una (30 en total, códigos `CEL-001`, `FUN-001`, `CAR-001`, `AUR-001`, `REP-001`…). El stock se carga como ingreso con motivo *Stock inicial*.
- 10 clientes de Tucumán, 5 con cuenta corriente (con y sin límite de crédito).
- 50 facturas repartidas en los últimos 30 días, de contado, con tarjeta y a cuenta corriente; 4 pagos de cuenta corriente y 2 facturas anuladas.
- 4 productos quedan bajo el stock mínimo, para ver la lista "Para reponer".

Se corre sobre una base recién migrada: si ya hay datos, avisa y no duplica nada. Para empezar de cero, borrar
`local.db` y volver a correr `db:migrate` y `db:seed`. Como el tablero muestra "los últimos 30 días" desde hoy,
conviene cargar los datos cerca de la fecha en que se van a mostrar.

Contra una base remota (Turso) el script solo crea los usuarios, salvo que se pida explícitamente:
`pnpm run db:seed -- --remoto`.

## Variables de entorno

Ver [`.env.example`](.env.example).

| Variable | Para qué |
| --- | --- |
| `DATABASE_URL` | `file:./local.db` en desarrollo; `libsql://...turso.io` en producción |
| `DATABASE_AUTH_TOKEN` | Token de Turso (solo producción) |
| `SESSION_SECRET` | Secreto para firmar la cookie de sesión (≥ 32 caracteres) |
| `SEED_*` | Nombre, email y contraseña de los usuarios de prueba que crea el seed |

## Usuarios de prueba

| Rol | Nombre | Email | Contraseña | Puede |
| --- | --- | --- | --- | --- |
| Administrador | Laura Méndez | `admin@celularestucu.test` | `admin1234` | Todo: usuarios, catálogo, categorías, movimientos de stock y anulación de facturas |
| Vendedor | Pablo Ruiz | `vendedor@celularestucu.test` | `vendedor1234` | Vender, consultar el catálogo, gestionar clientes y registrar pagos |

Con estos usuarios se ingresa tanto en local como en la versión publicada (la base de Turso ya los tiene cargados).
Son los valores de `SEED_*` de `.env.example`.

## Arquitectura

```
src/
├── app/
│   ├── login/                 # única página pública
│   ├── (app)/                 # páginas privadas (panel lateral + barra superior)
│   │   ├── ventas/  productos/  clientes/  usuarios/  perfil/
│   │   └── **/acciones.ts     # Server Actions (adaptadores finos)
│   └── api/                   # API REST (sección 11)
├── services/                  # reglas de negocio: validar → verificar rol → reglas → resultado
├── repositories/              # consultas Drizzle, sin reglas
├── db/                        # esquema, conexión y seed
├── lib/                       # errores (ApiError), esquemas Zod, sesión, envoltorios ruta()/accion(), formatos, constantes
├── components/                # ui/ (shadcn), base/ (primitivas), comunes/, layout/ y por módulo
└── middleware.ts              # proxy: sin cookie firmada → /login
```

## Identidad visual

Azul como color principal y verde como acento (marca del panel lateral y gráficos), con modo oscuro y
tipografía Geist. Los colores son tokens en `src/app/globals.css`; el ámbar queda solo para advertencias
(productos para reponer). Detalle en [`docs/04-pantallas-y-diseno.md`](docs/04-pantallas-y-diseno.md).

## Funcionalidades

| Requerimiento | Estado |
| --- | --- |
| RF-U1 a RF-U5 Usuarios y acceso | ✅ Implementado |
| RF-P1 a RF-P7 Productos y existencias | ✅ Implementado |
| RF-C1 a RF-C7 Clientes y cuenta corriente | ✅ Implementado |
| RF-V1 a RF-V9 Ventas | ✅ Implementado |
| RF-T1 a RF-T3 Tablero | ✅ Implementado |

La documentación completa para el equipo está en [`docs/`](docs/README.md).
