# Reglas de desarrollo (para el equipo y para cualquier IA)

> Estas reglas son **obligatorias**. Si una IA o una persona quiere hacer algo que no está acá, primero se consulta con el equipo.

## 1. Stack fijo (no cambiar)

| Qué | Usamos | Prohibido agregar |
| --- | --- | --- |
| Framework | Next.js 15 (App Router) + React 19 | Pages Router, Vite, Express, NestJS, otro backend |
| Lenguaje | **JavaScript** (`.js` / `.jsx`) | TypeScript, `.ts`, `.tsx` |
| Estilos | Tailwind CSS 4 (tokens en `globals.css`) | CSS Modules, styled-components, Bootstrap, MUI, shadcn, Chakra |
| Base de datos | PostgreSQL + Drizzle ORM (`drizzle-orm`, `postgres`) | Prisma, Mongoose, Sequelize, SQLite, Firebase, Supabase SDK |
| Contraseñas | `bcryptjs` | guardar en texto plano, md5, sha |
| Validaciones | `zod` | yup, joi, validar a mano sin esquema |
| Sesión | tabla `sesiones` + cookie HttpOnly | NextAuth/Auth.js, Clerk, JWT en localStorage |
| Gráficos (opcional) | Chart.js | otras librerías de gráficos |

**No instalar dependencias nuevas** sin acordarlo. Si hace falta una, se explica por qué y se agrega al README.

## 2. Arquitectura en capas (respetar siempre)

```
Interfaz              src/app/**/page.jsx, src/components/**
   │  fetch('/api/...')
   ▼
API (route handlers)  src/app/api/**/route.js      → recibe request, valida con zod, verifica sesión/permisos, llama al service, arma la respuesta
   ▼
Lógica de negocio     src/services/*.service.js    → reglas del enunciado, transacciones
   ▼
Acceso a datos        src/repositories/*.repository.js → solo consultas Drizzle, sin reglas de negocio
   ▼
Base de datos         src/db/ (conexión + schema)
```

- Los **componentes nunca** importan `db`, `repositories` ni `services`. Hablan con la API por `fetch`. (Excepción permitida: Server Components de página pueden llamar a un service para la carga inicial, nunca a un repository).
- Los **route handlers** no escriben SQL ni llaman a `db` directo: llaman a services.
- Los **services** no conocen `Request`/`Response`: reciben datos validados y el usuario de la sesión, devuelven datos o lanzan errores de `src/lib/errors.js`.
- Los **repositories** no validan reglas de negocio: solo leen/escriben. Aceptan un `tx` opcional para participar de transacciones.
- Validaciones de formato (zod) en `src/lib/validations/`. Se usan en la API **siempre**; en el front también para dar feedback inmediato, pero **el servidor es la autoridad**.

## 3. Reglas de negocio que no se pueden romper

1. **Importes en centavos enteros** en BD, API y lógica. Solo la interfaz convierte a pesos para mostrar/ingresar.
2. **El servidor calcula** precios, subtotales y totales leyendo la BD. Nunca confiar en precios/totales enviados por el navegador.
3. **Venta = una transacción**: venta + detalles + descuento de stock (UPDATE condicional `stock_actual >= cantidad`) + movimientos de salida. Si algo falla → rollback total.
4. **Número de comprobante** con secuencia/identity. Nunca `MAX(numero) + 1`.
5. **Copias históricas** en la venta: nombre y documento del cliente, descripción y precio de cada producto. El comprobante se muestra desde esas copias, nunca desde el catálogo.
6. **Stock nunca negativo.** Cantidades enteras > 0. El stock solo cambia con movimientos (`INICIAL`, `MANUAL`, `VENTA`), nunca editando el producto.
7. **Producto inactivo** no se puede vender (409), pero sigue en comprobantes y se le pueden hacer ajustes manuales.
8. **Cuenta corriente** solo con cliente registrado. La deuda **es** la venta: no hay tabla de deudas ni columna de saldo.
9. **Saldo** = ventas en cuenta corriente − pagos. **Pago ≤ saldo**, importe > 0, fecha no futura. Validación en transacción con bloqueo por cliente.
10. **Usuarios**: contraseña con bcrypt; nunca devolver `clave_hash`. Usuario inactivo no entra y pierde sus sesiones. No se puede desactivar ni quitar admin al último administrador activo.
11. **Permisos en el servidor**: toda ruta `/api/*` (salvo `POST /api/sesion`) exige sesión; `/api/usuarios*` exige administrador. Ocultar botones en el front **no** alcanza.
12. **Sin borrados físicos** de ventas, pagos, movimientos, productos ni usuarios. Sin edición de ventas/pagos confirmados.
13. **Fuera de alcance — no implementar**: impuestos, descuentos, devoluciones, anulaciones, cuotas, pagos combinados, múltiples depósitos/monedas/empresas, AFIP/ARCA, números de tarjeta, recuperación/cambio de contraseña, registro público de usuarios.

## 4. Convenciones de código

- Nombres de variables, funciones, archivos y mensajes **en español** (igual que la API): `crearVenta`, `precioVentaCentavos`, `clientes.service.js`.
- BD en `snake_case`, JS/API en `camelCase`.
- Componentes en `PascalCase.jsx`; un componente por archivo. `"use client"` solo donde hay estado o eventos.
- Usar los componentes de `src/components/ui/` (Button, Card, Input, Table, Badge, Alert…) en lugar de repetir estilos.
- Respuestas de error con el formato `{ error: { codigo, mensaje, detalles } }` vía el helper de `src/lib/errors.js`.
- Moneda y fechas siempre con los helpers de `src/lib/format.js`.
- Constantes (formas de pago, tipos, orígenes, umbral stock bajo = 3) desde `src/lib/constants.js`. Nada de strings mágicos repetidos.
- Mensajes al usuario claros y en español rioplatense (como el mockup: "Agregá", "Seleccioná").
- Nada de secretos en el código: todo en `.env` (ver `.env.example`).

## 5. Flujo de trabajo con Git

- `main` siempre compila (`npm run build`).
- Cada integrante trabaja en una rama: `feature/ventas`, `feature/productos`, etc. y abre Pull Request a `main`.
- Commits chicos y descriptivos en español: `ventas: confirmar venta en transacción`.
- Antes de pushear: `npm run build` sin errores.
- No modificar archivos de otro módulo sin avisar. Los archivos compartidos (`src/lib/*`, `src/db/schema/*`, `src/components/ui/*`, `src/components/layout/*`) se tocan con cuidado y avisando al equipo.

## 6. Checklist antes de dar algo por terminado

- [ ] Cumple lo que dice `docs/01-enunciado.md` para ese módulo.
- [ ] Respeta rutas, campos y códigos de `docs/02-api-rest.md`.
- [ ] Respeta tablas y constraints de `docs/03-base-de-datos.md`.
- [ ] Se ve como el mockup (`docs/04-pantallas-y-diseno.md`) y funciona en celular.
- [ ] Valida en el servidor y muestra errores claros en la interfaz.
- [ ] `npm run build` pasa.
- [ ] Se marcó el avance en `docs/06-checklist.md`.
