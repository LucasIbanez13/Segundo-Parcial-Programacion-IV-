// Esquemas de categorías (sección 11.4, RF-P7). Compartidos por los formularios y por categorias.service.
// .strict(): un campo no previsto responde 422 VALIDACION.
import { z } from "zod";
import { MENSAJE_CAMPOS_EXTRA, textoObligatorio } from "./comun";

const nombre = textoObligatorio("El nombre", 60);
const activa = z.boolean({ invalid_type_error: "El estado debe ser verdadero o falso." });

// POST /api/categorias — RF-P7. La categoría nace activa.
export const crearCategoriaSchema = z.object({ nombre }).strict(MENSAJE_CAMPOS_EXTRA);

// PATCH /api/categorias/{id} — RF-P7. Cualquiera de los campos; lo omitido conserva su valor.
export const editarCategoriaSchema = z
  .object({ nombre: nombre.optional(), activa: activa.optional() })
  .strict(MENSAJE_CAMPOS_EXTRA);

// GET /api/categorias — por defecto solo las activas (sección 11.4). El admin puede pedir
// activa=false o activa=todos para reactivar categorías desde su pantalla.
export const filtrosCategoriasSchema = z.object({
  activa: z
    .enum(["true", "false", "todos"], {
      errorMap: () => ({ message: "El filtro activa debe ser true, false o todos." }),
    })
    .default("true"),
});

export type CrearCategoriaEntrada = z.input<typeof crearCategoriaSchema>;
export type EditarCategoriaEntrada = z.input<typeof editarCategoriaSchema>;
