# Prompts para usar con la IA

Copiar y pegar. Reemplazar lo que está entre `< >`.

## Antes de empezar cualquier tarea
```
Leé AGENTS.md y toda la carpeta docs/ antes de hacer nada. Respetá el stack, las capas de la sección 10
y la API de la sección 11 del enunciado. No instales dependencias nuevas. Si algo que te pido contradice
el enunciado, avisame antes de hacerlo.
```

## Implementar un módulo
```
Implementá <RF-xx> según docs/01-enunciado.md. Esquema en src/db/schema (y pnpm run db:generate),
esquemas Zod en src/lib/schemas, reglas en src/services/<modulo>.service.ts (validar → exigirRol → reglas,
con comentario citando el RF o la regla), rutas finas con ruta() y pantallas con shadcn/ui y las primitivas.
Al terminar: pnpm run build y marcá lo hecho en docs/06-checklist.md.
```

## Revisar contra el enunciado
```
Revisá <módulo> contra docs/01-enunciado.md (RF, reglas de la sección 6 y lista de control de la 10.8).
Listame qué no se cumple. No cambies código todavía.
```
