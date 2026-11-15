# Instrucciones para asistentes de IA

Este repositorio es el **2º Parcial de Programación IV**: "mostrador", un sistema de gestión comercial
(facturación, productos y existencias, clientes con cuenta corriente, usuarios con roles y tablero).
Lo desarrollan 3 estudiantes en equipo.

## Antes de escribir código: leer `docs/`

| Archivo | Para qué |
| --- | --- |
| `docs/01-enunciado.md` | Enunciado oficial completo (requerimientos RF-*, reglas, modelo, arquitectura y API). **Fuente de verdad.** |
| `docs/02-api-rest.md` | Decisiones de implementación de la API (el contrato es la sección 11 del enunciado). |
| `docs/03-base-de-datos.md` | Cómo implementamos el modelo de la sección 7. |
| `docs/04-pantallas-y-diseno.md` | Rutas, identidad visual propia y componentes comunes. |
| `docs/05-reglas-de-desarrollo.md` | Stack, capas y convenciones (secciones 9 y 10). |
| `docs/06-checklist.md` | Estado de avance. Marcar lo que se termina. |

Prioridad ante contradicciones: enunciado > resto de `docs/` > código existente.

## Límites estrictos

1. **No salirse del alcance** del enunciado ni agregar funcionalidades que nadie pidió.
2. **Stack de la sección 9:** TypeScript, Next.js App Router, Tailwind, shadcn/ui, Chart.js, SQLite/libSQL (Turso), Drizzle + drizzle-kit, Zod y pnpm. **No instalar otras dependencias** sin que el usuario lo apruebe.
3. **Contrato de la sección 11:** rutas, campos, códigos HTTP y formato de error tal cual. Si algo parece mal, avisar en vez de cambiarlo.
4. **Capas (sección 10):** las reglas viven **solo** en `src/services/`. Las rutas (`ruta()`) y Server Actions (`accion()`) son adaptadores finos. Los repositories solo hacen consultas.
5. Cada función de servicio: `validar(esquema)` → `exigirRol()` → reglas → resultado, con un comentario que cite el RF o la regla.
6. **Importes en centavos enteros.** El servidor calcula precios y totales.
7. **Transacciones** para toda operación que toque más de una tabla. La existencia solo cambia en `moverStock()`.
8. **Trabajar solo en los archivos de la tarea.** Los compartidos (`src/lib/`, `src/db/schema/`, `src/components/ui/`, `src/components/base/`, `src/components/comunes/`, `src/components/layout/`) se modifican solo si hace falta y avisando.
9. **Nunca** poner credenciales, contraseñas ni URLs de base de datos en el código. Todo va en `.env` (ver `.env.example`).
10. Código, nombres y mensajes **en español**, rioplatense en la interfaz ("Ingresá", "Seleccioná").

## Al terminar una tarea

- Correr `pnpm run build` y confirmar que pasa.
- Si cambió el esquema: `pnpm run db:generate` y subir la migración de `drizzle/`.
- Marcar lo completado en `docs/06-checklist.md`.
- Explicar brevemente qué se hizo y en qué archivos, para que el equipo pueda defenderlo.

## Comandos

```bash
pnpm install
cp .env.example .env
pnpm run db:migrate   # aplica las migraciones de drizzle/
pnpm run db:seed      # usuarios de prueba (y más datos en cada hito)
pnpm run dev          # http://localhost:3000
pnpm run build        # verificar que compila
pnpm run db:generate  # crea una migración nueva después de cambiar src/db/schema
```
