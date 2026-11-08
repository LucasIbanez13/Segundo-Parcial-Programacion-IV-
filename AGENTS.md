# Instrucciones para asistentes de IA

Este repositorio es el **Segundo Parcial de Programación IV**: "mostrador", un sistema de ventas y gestión comercial
(ventas, productos y stock, clientes con cuenta corriente, usuarios). Lo desarrollan 3 estudiantes en equipo.

## Antes de escribir código: leer `docs/`

| Archivo | Para qué |
| --- | --- |
| `docs/01-enunciado.md` | Requisitos oficiales. **Fuente de verdad.** |
| `docs/02-api-rest.md` | Contrato de la API (rutas, campos, códigos HTTP, errores). |
| `docs/03-base-de-datos.md` | Tablas, columnas, constraints e invariantes. |
| `docs/04-pantallas-y-diseno.md` | Pantallas, rutas, colores y tipografía. |
| `docs/05-reglas-de-desarrollo.md` | Stack, arquitectura en capas, reglas de negocio, convenciones. |
| `docs/06-checklist.md` | Estado de avance. Marcar lo que se termina. |

Prioridad ante contradicciones: enunciado > API > base de datos > pantallas > resto.

## Límites estrictos

1. **No salirse del alcance.** Implementar solo lo que piden `docs/01-enunciado.md` y lo que el usuario pide explícitamente. Nada de funcionalidades "extra" (impuestos, descuentos, devoluciones, anulaciones, cuotas, registro público, recuperación de contraseña, multi-empresa, AFIP/ARCA, números de tarjeta). Los opcionales del enunciado solo si el usuario los pide.
2. **Stack fijo:** Next.js 15 App Router + React 19 en **JavaScript** (no TypeScript), Tailwind CSS 4, PostgreSQL + Drizzle ORM, bcryptjs, zod. **No instalar dependencias nuevas** ni cambiar de librería sin que el usuario lo apruebe.
3. **No cambiar el contrato:** rutas de la API, nombres de campos, nombres de tablas/columnas, códigos HTTP y formato de error son los de `docs/`. Si algo parece mal, avisar en vez de cambiarlo.
4. **Arquitectura en capas:** `page/componente → fetch /api → route.js → services/ → repositories/ → db/`. Los componentes no importan `db` ni repositories. Los route handlers no hacen SQL. Los repositories no tienen reglas de negocio.
5. **Validar en el servidor siempre** (zod + reglas en services). Verificar sesión en toda la API y rol administrador en `/api/usuarios*`.
6. **Importes en centavos enteros.** El servidor calcula precios y totales; nunca confía en los del navegador.
7. **Transacciones:** venta completa (comprobante + detalles + stock + movimientos), alta de producto con stock inicial, movimiento manual, y pagos (con bloqueo por cliente).
8. **Trabajar solo en los archivos de la tarea pedida.** No reescribir ni "mejorar" otros módulos. Los archivos compartidos (`src/lib/`, `src/db/schema/`, `src/components/ui/`, `src/components/layout/`) se modifican solo si la tarea lo requiere y avisando.
9. **Nunca** poner credenciales, contraseñas o URLs de base de datos en el código. Todo va en `.env` (ver `.env.example`).
10. Código, nombres y mensajes **en español** (rioplatense en la UI: "Agregá", "Seleccioná").

## Al terminar una tarea

- Correr `npm run build` y confirmar que pasa.
- Marcar en `docs/06-checklist.md` lo completado.
- Explicar brevemente qué se hizo y en qué archivos, para que el equipo pueda defenderlo en la evaluación.

## Comandos

```bash
npm install          # dependencias
npm run dev          # servidor local en http://localhost:3000
npm run build        # verificar que compila
npm run db:push      # crear/actualizar tablas en la BD
npm run db:seed      # crear el primer administrador y datos de ejemplo
```
