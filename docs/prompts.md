# Prompts para usar con la IA

Copiar y pegar. Reemplazar lo que está entre `< >`.

## Antes de empezar cualquier tarea
```
Leé AGENTS.md y toda la carpeta docs/ antes de hacer nada. Respetá el stack, la arquitectura en capas
y las reglas de negocio que están ahí. No instales dependencias ni cambies rutas, nombres de campos o
tablas. Si algo que te pido contradice docs/, avisame antes de hacerlo.
```

## Implementar un módulo
```
Implementá <el módulo / la funcionalidad> siguiendo docs/02-api-rest.md, docs/03-base-de-datos.md y
docs/04-pantallas-y-diseno.md. Trabajá solo en estos archivos: <lista de archivos>.
Respetá la arquitectura: route handler → service → repository. Validá con zod en el servidor.
Al terminar, corré `npm run build` y marcá lo hecho en docs/06-checklist.md.
```

## Revisar que algo cumpla el enunciado
```
Revisá <archivo o módulo> contra docs/01-enunciado.md, docs/02-api-rest.md y docs/05-reglas-de-desarrollo.md.
Listame qué requisito no se cumple, qué validación falta en el servidor y qué regla de negocio se rompe.
No cambies código todavía, solo el informe.
```

## Pantalla igual al mockup
```
Armá la pantalla <ruta> igual al mockup descrito en docs/04-pantallas-y-diseno.md (y docs/mockup/mockup.html).
Usá los componentes de src/components/ui y los colores de globals.css. Tiene que funcionar en celular.
Los datos vienen de la API (fetch), no hardcodeados.
```

## Buscar errores
```
Revisá <archivo> buscando bugs: transacciones incompletas, stock que pueda quedar negativo, montos que no
estén en centavos, permisos que no se verifiquen en el servidor, errores que no sigan el formato de
docs/02-api-rest.md. Explicame cada problema y proponé el arreglo.
```
