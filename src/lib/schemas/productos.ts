// Esquemas de productos (sección 11.4, RF-P1 a RF-P3). Compartidos por los formularios y por productos.service.
// .strict(): un campo no previsto responde 422 VALIDACION (sección 10.4).
import { z } from "zod";
import { booleanoTexto, idTexto, MENSAJE_CAMPOS_EXTRA, paginacion, textoBusqueda, textoObligatorio } from "./comun";

// Tope razonable para que un importe nunca se acerque al límite de los enteros seguros de JavaScript.
const PRECIO_MAXIMO = 100_000_000_000; // $ 1.000.000.000,00
const CANTIDAD_MAXIMA = 1_000_000;

// Solo letras sin acento, números y . _ - /: así el índice único sobre lower(codigo) no distingue mayúsculas
// (el lower() de SQLite no convierte letras acentuadas).
const codigo = textoObligatorio("El código", 30).regex(
  /^[A-Za-z0-9][A-Za-z0-9._\-/]*$/,
  "El código solo puede tener letras sin acento, números, puntos, guiones o barras, sin espacios.",
);
const descripcion = textoObligatorio("La descripción", 200, true);

const categoriaId = z
  .number({ required_error: "Seleccioná una categoría.", invalid_type_error: "Seleccioná una categoría." })
  .int("Seleccioná una categoría.")
  .positive("Seleccioná una categoría.");

// Regla 10: importes en centavos enteros.
const precio = z
  .number({ required_error: "El precio es obligatorio.", invalid_type_error: "El precio debe ser un número." })
  .int("El precio debe estar en centavos enteros.")
  .positive("El precio debe ser mayor que cero.")
  .max(PRECIO_MAXIMO, "El precio es demasiado alto.");

const cantidadNoNegativa = (etiqueta: string) =>
  z
    .number({ invalid_type_error: `${etiqueta} debe ser un número.` })
    .int(`${etiqueta} debe ser un número entero.`)
    .min(0, `${etiqueta} no puede ser negativo.`)
    .max(CANTIDAD_MAXIMA, `${etiqueta} es demasiado alto.`);

const activo = z.boolean({ invalid_type_error: "El estado debe ser verdadero o falso." });

// RF-P2: la existencia no se edita a mano. Se declara aparte para dar un mensaje claro en vez del genérico.
const existenciaProhibida = z.undefined({
  invalid_type_error: "La existencia no se edita a mano: registrá un ingreso o un egreso de stock.",
});

// POST /api/productos — RF-P2. Si llega stockInicial > 0 se graba como un ingreso con motivo "Stock inicial".
export const crearProductoSchema = z
  .object({
    codigo,
    descripcion,
    categoriaId,
    precio,
    stockMinimo: cantidadNoNegativa("El stock mínimo").default(0),
    stockInicial: cantidadNoNegativa("El stock inicial").optional(),
    existencia: existenciaProhibida,
  })
  .strict(MENSAJE_CAMPOS_EXTRA);

// PATCH /api/productos/{id} — RF-P2 y RF-P3 (activo: false es la baja lógica).
export const editarProductoSchema = z
  .object({
    codigo: codigo.optional(),
    descripcion: descripcion.optional(),
    categoriaId: categoriaId.optional(),
    precio: precio.optional(),
    stockMinimo: cantidadNoNegativa("El stock mínimo").optional(),
    activo: activo.optional(),
    existencia: existenciaProhibida,
  })
  .strict(MENSAJE_CAMPOS_EXTRA);

// GET /api/productos — RF-P1. q (código o descripción), categoriaId, bajoMinimo, activo y paginación.
// activo: por defecto "true"; "false" y "todos" quedan para el administrador.
export const filtrosProductosSchema = paginacion.extend({
  q: textoBusqueda,
  categoriaId: idTexto.optional(),
  bajoMinimo: booleanoTexto.optional(),
  activo: z
    .enum(["true", "false", "todos"], {
      errorMap: () => ({ message: "El filtro activo debe ser true, false o todos." }),
    })
    .default("true"),
});

export type CrearProductoEntrada = z.input<typeof crearProductoSchema>;
export type EditarProductoEntrada = z.input<typeof editarProductoSchema>;
export type FiltrosProductos = z.output<typeof filtrosProductosSchema>;
