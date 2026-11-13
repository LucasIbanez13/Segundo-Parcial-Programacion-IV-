# Reglas de desarrollo (para el equipo y para cualquier IA)

> Son **obligatorias**. Salen de las secciones 9 y 10 del enunciado. Si algo no está acá, se consulta con el equipo.

## 1. Stack (sección 9)

| Qué | Usamos | No usar |
| --- | --- | --- |
| Lenguaje | **TypeScript** (`.ts` / `.tsx`, `strict`) | JavaScript suelto (`.js`/`.jsx`) en `src/` |
| Framework | Next.js 15 (App Router) + React 19 | Pages Router, otro backend |
| API | REST con Route Handlers (`route.ts`) | tRPC, GraphQL |
| Estilos | Tailwind CSS 4 (tokens en `globals.css`) | CSS Modules, styled-components, Bootstrap, MUI |
| Componentes | **shadcn/ui** (`src/components/ui/`) | otras librerías de componentes |
| Gráficos | Chart.js + `react-chartjs-2` | otras librerías de gráficos |
| Base de datos | SQLite (dev) / libSQL Turso (prod) con `@libsql/client` | PostgreSQL, Prisma, Mongo |
| Acceso a datos | Drizzle ORM + migraciones `drizzle-kit` | SQL a mano fuera de repositories |
| Validación | Zod, esquemas compartidos en `src/lib/schemas/` | yup, joi, validar a mano |
| Sesión | Propia, en cookie `httpOnly` firmada (HMAC) | JWT en localStorage |
| Contraseñas | `bcryptjs` | texto plano, md5, sha |
| Gestor de paquetes | **pnpm** | npm / yarn (no subir `package-lock.json`) |

Para agregar componentes de shadcn: `pnpm dlx shadcn@latest add <componente>`. **No instalar otras dependencias** sin acordarlo con el equipo.

## 2. Capas (sección 10)

```
Interfaz          src/app/**/page.tsx, src/components/**   → muestra, adelanta validaciones, avisa resultados
   │  Server Components llaman a services para leer · formularios usan Server Actions o fetch a /api
Adaptadores       src/app/api/**/route.ts  (envoltorio ruta())      → sesión, params, JSON, errores
                  src/app/(app)/**/acciones.ts (envoltorio accion()) → { ok, data } | { ok: false, error }
   ▼
Servicios         src/services/*.service.ts   → valida (Zod) → verifica rol → reglas → transacción → forma pública
   ▼
Acceso a datos    src/repositories/*.repository.ts (consultas Drizzle) + src/db/ (esquema, conexión)
```

- **Cada regla de negocio vive en un único lugar: el servicio.** Las rutas y acciones no validan ni deciden.
- Cada función de servicio recibe `(usuario, datosSinValidar)` y sigue el orden: `validar(esquema)` → `exigirRol()` → reglas → resultado.
- Cada función de servicio lleva un comentario que cita el requerimiento o la regla (`// RF-U4`, `// regla 2`).
- Los servicios lanzan solo `ApiError(status, code, message, details)` (`src/lib/errors.ts`), con los códigos de la sección 11.8.
- Los repositories no tienen reglas y aceptan un `ejecutor` (`tx`) para participar de transacciones.
- Los componentes de cliente **nunca** importan `db`, repositories ni services (solo `import type`).
- Sesión con tres barreras: `src/middleware.ts` (firma de la cookie), cada página o layout (`getCurrentUser()` contra la BD) y cada servicio (`exigirRol`).

## 3. Interfaz (secciones 8 y 10.6)

- Páginas sin etiquetas HTML sueltas: primitivas (`Pila`, `Fila`, `Grilla`, `Texto`, `Titulo`), shadcn/ui y componentes del dominio.
- Formularios con el hook `useFormulario` (`src/hooks/use-formulario.ts`): errores de Zod primero, después los del servidor, estado de envío y aviso (toast).
- Listados: búsqueda, filtros y página en la URL. Siempre con estado de carga (`loading.tsx`), vacío y error.
- Acciones irreversibles con `ConfirmarAccion`.
- Formatos solo desde `src/lib/format.ts`.
- Textos en español rioplatense ("Ingresá", "Seleccioná").

## 4. Convenciones

- Nombres en español (`crearUsuario`, `exigirRol`). Los campos de la API son los de la sección 11 (`email`, `password`, `rol`, `page`, `pageSize`…).
- Importes en centavos enteros. El servidor calcula precios y totales.
- Secretos solo en `.env` (ver `.env.example`). Nunca en el código.

## 5. Git

- `main` siempre compila (`pnpm run build`). Cada integrante trabaja en una rama `feature/...` y abre un Pull Request.
- Commits chicos en español: `usuarios: restablecer contraseña`.
