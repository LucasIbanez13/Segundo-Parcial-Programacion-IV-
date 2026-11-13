# Instrucciones para GitHub Copilot

Seguí todas las reglas de [`AGENTS.md`](../AGENTS.md) y la documentación de [`docs/`](../docs/README.md).

Resumen obligatorio:
- TypeScript + Next.js App Router, Tailwind, shadcn/ui, SQLite/libSQL (Turso) + Drizzle, Zod, pnpm. No agregar dependencias.
- Las reglas de negocio viven solo en `src/services/`. Las rutas (`ruta()`) y las Server Actions (`accion()`) solo llaman al servicio.
- La API es exactamente la de la sección 11 de `docs/01-enunciado.md`.
- Importes en centavos enteros; el servidor calcula y valida todo.
- Código y mensajes en español.
