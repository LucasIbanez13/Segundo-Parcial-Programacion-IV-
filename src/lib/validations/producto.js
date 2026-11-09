// Esquemas zod de producto. Contrato: docs/02-api-rest.md (Productos)
// .strict() hace que un campo desconocido o de solo lectura (id, stockActual...) responda 422.
import { z } from "zod";
import { booleano, entero, enteroPositivo, textoBusqueda, textoObligatorio } from "./comun.js";

const codigo = textoObligatorio("El código");
const nombre = textoObligatorio("El nombre");
const precioVentaCentavos = enteroPositivo("El precio");
const activo = booleano("El estado");

export const crearProductoSchema = z
  .object({
    codigo,
    nombre,
    precioVentaCentavos,
    stockInicial: entero("El stock inicial").nonnegative("El stock inicial no puede ser negativo."),
    activo,
  })
  .strict();

// Edición parcial: lo omitido conserva su valor. El stock solo cambia con movimientos.
export const actualizarProductoSchema = z
  .object({
    codigo: codigo.optional(),
    nombre: nombre.optional(),
    precioVentaCentavos: precioVentaCentavos.optional(),
    activo: activo.optional(),
  })
  .strict();

// Query string de GET /api/productos.
export const filtrosProductosSchema = z.object({
  q: textoBusqueda,
  activo: z
    .enum(["true", "false"], { message: "El filtro activo debe ser true o false." })
    .transform((valor) => valor === "true")
    .optional(),
});
