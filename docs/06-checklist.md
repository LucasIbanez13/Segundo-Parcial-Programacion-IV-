# Checklist de requisitos

> Marcar `[x]` al terminar y probar cada punto. Completar la columna "Responsable" al repartir el trabajo.

## Base / infraestructura
| Hecho | Requisito | Responsable |
| --- | --- | --- |
| [ ] | Conexión a PostgreSQL (`src/db/index.js`) | |
| [ ] | Schema Drizzle de todas las tablas + `npm run db:push` funciona | |
| [ ] | Seed: primer administrador desde `.env` + datos de ejemplo | |
| [ ] | Helpers: errores, formato de moneda/fecha, constantes | |
| [ ] | Componentes UI base (Button, Card, Input, Select, Table, Badge, Alert, PageHeader, StatCard, Modal) | |
| [x] | Layout: Sidebar + Header con usuario y cerrar sesión, responsive | Lucas |

## Usuarios y acceso
| Hecho | Requisito | Responsable |
| --- | --- | --- |
| [x] | `POST/GET/DELETE /api/sesion` (login, sesión actual, logout) | Lucas |
| [x] | Contraseñas con bcrypt, nunca devueltas | Lucas |
| [x] | Usuario inactivo no puede iniciar sesión y pierde sesiones abiertas | Lucas |
| [x] | Middleware: sin sesión → `/login` | Lucas |
| [x] | `/api/usuarios*` solo admin (verificado en servidor) | Lucas |
| [x] | Listar / crear / editar / activar-desactivar usuarios | Lucas |
| [x] | No se puede desactivar ni quitar admin al último administrador | Lucas |
| [x] | Pantalla de login | Lucas |

## Productos y stock
| Hecho | Requisito | Responsable |
| --- | --- | --- |
| [ ] | Alta de producto (código único, precio > 0, stock inicial ≥ 0) | |
| [ ] | Stock inicial > 0 genera movimiento `INICIAL` en la misma transacción | |
| [ ] | Consultar y modificar producto (sin tocar stock) | |
| [ ] | Activar / desactivar (baja lógica) | |
| [ ] | Búsqueda por nombre o código (sin acentos ni mayúsculas) | |
| [ ] | Movimiento manual de entrada / salida con cantidad y motivo | |
| [ ] | Salida mayor al stock → 409 | |
| [ ] | Historial de movimientos distinguiendo manual / inicial / venta | |
| [ ] | Indicadores: activos, stock bajo (≤ 3), movimientos recientes | |

## Clientes y cuenta corriente
| Hecho | Requisito | Responsable |
| --- | --- | --- |
| [ ] | Alta / consulta / edición de cliente (al menos un contacto) | Lucila (implementado, falta probar con BD y sesión) |
| [ ] | Búsqueda por nombre o documento | Lucila (implementado, falta probar con BD y sesión) |
| [ ] | Saldo calculado (ventas cta. cte. − pagos) en listado y detalle | Lucila (implementado, falta probar con BD y sesión) |
| [ ] | Cuenta corriente: saldo + movimientos (ventas y pagos) | Lucila (implementado, falta probar con BD y sesión) |
| [ ] | Registrar pago (fecha no futura, importe > 0 y ≤ saldo) con bloqueo | Lucila (implementado, falta probar con BD y sesión) |

## Ventas
| Hecho | Requisito | Responsable |
| --- | --- | --- |
| [ ] | Seleccionar consumidor final o cliente registrado | Lucila (implementado, falta probar con BD y sesión) |
| [ ] | Alta de cliente durante la venta sin perder lo cargado | Lucila (implementado, falta probar con BD y sesión) |
| [ ] | Agregar / quitar productos (solo activos) y cambiar cantidades | Lucila (implementado, falta probar con BD y sesión) |
| [ ] | Subtotales y total se recalculan en vivo | Lucila (implementado, falta probar con BD y sesión) |
| [ ] | Forma de pago: contado, tarjeta, cuenta corriente (solo con cliente) | Lucila (implementado, falta probar con BD y sesión) |
| [ ] | Servidor agrupa repetidos, toma precios de la BD, valida activo y stock | Lucila (implementado, falta probar con BD y sesión) |
| [ ] | Transacción: venta + detalles + descuento de stock + movimientos | Lucila (implementado, falta probar con BD y sesión) |
| [ ] | Número de comprobante único (secuencia) | Lucila (implementado, falta probar con BD y sesión) |
| [ ] | Copias históricas de cliente y productos | Lucila (implementado, falta probar con BD y sesión) |
| [ ] | Error de stock claro y posibilidad de corregir la venta | Lucila (implementado, falta probar con BD y sesión) |
| [ ] | Listado de ventas | Lucila (implementado, falta probar con BD y sesión) |
| [ ] | Detalle del comprobante | Lucila (implementado, falta probar con BD y sesión) |

## Entrega
| Hecho | Requisito | Responsable |
| --- | --- | --- |
| [ ] | README completo (descripción, instalación, BD, admin inicial, link, credenciales, funcionalidades) | |
| [ ] | App publicada (ej. Vercel) + BD en la nube (ej. Neon) | |
| [ ] | Datos de ejemplo cargados en producción | |
| [ ] | Sin credenciales en el código | |

## Opcionales (solo cuando todo lo anterior esté listo)
| Hecho | Requisito | Responsable |
| --- | --- | --- |
| [ ] | Imprimir comprobante | |
| [ ] | Filtros de ventas por fecha, cliente o forma de pago | |
| [ ] | Panel inicial con indicadores | |
| [ ] | Gráficos con Chart.js | |
