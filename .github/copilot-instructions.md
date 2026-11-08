# Instrucciones para GitHub Copilot

Seguí todas las reglas de [`AGENTS.md`](../AGENTS.md) y la documentación de [`docs/`](../docs/README.md).

Resumen obligatorio:
- Next.js 15 App Router + React 19 en **JavaScript** (sin TypeScript), Tailwind CSS 4, PostgreSQL + Drizzle, bcryptjs, zod. No agregar dependencias.
- Capas: componente → `fetch /api` → `route.js` → `services/` → `repositories/` → `db/`.
- API, campos y tablas exactamente como en `docs/02-api-rest.md` y `docs/03-base-de-datos.md`.
- Importes en centavos enteros; el servidor calcula totales y valida todo.
- Solo lo que pide `docs/01-enunciado.md`. Nada fuera de alcance.
- Código y mensajes en español.
