# Checklist de requisitos

> Marcar `[x]` al terminar y probar cada punto. Los códigos son los del enunciado (sección 5). Orden de hitos: sección 12.

## Base (hito 1)
| Hecho | Requisito | Responsable |
| --- | --- | --- |
| [x] | Migración a TypeScript + pnpm + shadcn/ui + SQLite/libSQL (sección 9) | Lucas |
| [x] | Conexión Drizzle + libSQL y migraciones con `drizzle-kit` (`db:generate`, `db:migrate`) | Lucas |
| [x] | `ApiError` + códigos de la sección 11.8 + formato `{ error: { code, message, details } }` | Lucas |
| [x] | Envoltorios `ruta()` (Route Handlers) y `accion()` (Server Actions) | Lucas |
| [x] | Esquemas Zod compartidos (`src/lib/schemas/`) con `.strict()` | Lucas |
| [x] | Primitivas de maquetación y componentes comunes (encabezado, estados, confirmar, campo, insignias, paginador) | Lucas |
| [x] | Hook `useFormulario` | Lucas |
| [x] | Módulo de formatos (`src/lib/format.ts`) | Lucas |
| [x] | Layout: panel lateral con el módulo activo, que se colapsa en el teléfono, y barra superior con el usuario | Lucas |
| [ ] | Campo de importe (pesos ↔ centavos) | |
| [ ] | Publicación en Vercel + Turso | |

## Usuarios y acceso (RF-U)
| Hecho | Requisito | Responsable |
| --- | --- | --- |
| [x] | RF-U1 `POST /api/auth/login` y `POST /api/auth/logout`. Mismo 401 para email inexistente, contraseña mala o usuario inactivo | Lucas |
| [x] | RF-U2 `GET /api/auth/me` + triple barrera (proxy, páginas, servicios) + usuario resuelto contra la BD en cada pedido | Lucas |
| [x] | RF-U3 Seed con admin y vendedor usando `usuarios.service` | Lucas |
| [x] | RF-U4 `GET/POST /api/usuarios`, `PATCH /api/usuarios/{id}` (`EMAIL_DUPLICADO`, `OPERACION_SOBRE_SI_MISMO`) | Lucas |
| [x] | RF-U4 Pantallas `/usuarios`, `/usuarios/nuevo` y `/usuarios/[id]`, con desactivación confirmada | Lucas |
| [x] | RF-U5 `PUT /api/auth/password` + pantalla `/perfil` | Lucas |
| [x] | RF-U5 `POST /api/usuarios/{id}/reset-password` + contraseña temporal mostrada una vez | Lucas |
| [x] | Vendedor que llama a una ruta de admin → `403 SIN_PERMISO` (aunque mande datos inválidos) | Lucas |
| [x] | Listado: columnas Usuario, Email, Rol, Estado y Acciones; filtro `activo=true/false/todos`; usable a 360 px | Lucas |
| [x] | Confirmación (AlertDialog) al desactivar desde la tabla y desde el formulario de edición | Lucas |
| [x] | Barra superior: usuario, rol, acceso a `/perfil` y botón Salir siempre visible | Lucas |

## Productos y existencias (RF-P, hito 1)
| Hecho | Requisito | Responsable |
| --- | --- | --- |
| [ ] | RF-P7 Categorías (alta, edición, baja; `NOMBRE_DUPLICADO`, `CATEGORIA_EN_USO`) | |
| [ ] | RF-P1 Catálogo paginado con filtros y marca de bajo mínimo | |
| [ ] | RF-P2 Alta y edición (stock inicial como ingreso, `existencia` rechazada en PATCH) | |
| [ ] | RF-P3 Baja lógica | |
| [ ] | RF-P4/P5 Ingresos y egresos con `moverStock()` (única función que cambia la existencia) | |
| [ ] | RF-P6 Movimientos con existencia resultante, usuario y referencia | |

## Clientes y cuenta corriente (RF-C, hito 2)
| Hecho | Requisito | Responsable |
| --- | --- | --- |
| [ ] | RF-C1 Listado con saldo | |
| [ ] | RF-C2 Alta y edición (DNI/CUIT único, cuenta corriente, límite) | |
| [ ] | RF-C3 Ficha con últimas facturas | |
| [ ] | RF-C4 Cuenta corriente con saldo acumulado | |
| [ ] | RF-C5 Registrar pago con recibo numerado e imprimible | |
| [ ] | RF-C6 Saldos | |
| [ ] | RF-C7 Baja lógica (`SALDO_PENDIENTE`) | |

## Ventas (RF-V, hito 3)
| Hecho | Requisito | Responsable |
| --- | --- | --- |
| [ ] | RF-V1 a RF-V5 Nueva venta (comprador, ítems, existencia, formas de pago, teclado) | |
| [ ] | RF-V6 Confirmación en una transacción con numeración correlativa | |
| [ ] | RF-V7 Comprobante imprimible | |
| [ ] | RF-V8 Listado con filtros y paginado | |
| [ ] | RF-V9 Anulación (solo admin) | |

## Tablero y cierre (RF-T, hito 4)
| Hecho | Requisito | Responsable |
| --- | --- | --- |
| [ ] | RF-T1 a RF-T3 `GET /api/tablero` + gráficos con Chart.js | |
| [ ] | Seed completo: 2 usuarios, 5 categorías, 30 productos, 10 clientes y 50 facturas, con servicios | |
| [ ] | README final (integrantes, URL, instalación, variables, usuarios de prueba) | |
