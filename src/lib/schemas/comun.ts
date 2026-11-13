// Piezas de Zod reutilizables por todos los módulos. Compartidas entre cliente y servidor (sección 10.4).
import { z } from "zod";
import {
  PAGINA_TAMANO_MAXIMO,
  PAGINA_TAMANO_POR_DEFECTO,
  PASSWORD_MAXIMO_BYTES,
  PASSWORD_MINIMO,
} from "@/lib/constants";

// Texto obligatorio: no puede quedar vacío después de trim().
export function textoObligatorio(etiqueta: string, maximo = 200) {
  return z
    .string({ required_error: `${etiqueta} es obligatorio.`, invalid_type_error: `${etiqueta} debe ser un texto.` })
    .trim()
    .min(1, `${etiqueta} es obligatorio.`)
    .max(maximo, `${etiqueta} no puede superar los ${maximo} caracteres.`);
}

// Email normalizado: sin espacios en los extremos y en minúsculas.
export const email = z
  .string({ required_error: "El email es obligatorio.", invalid_type_error: "El email debe ser un texto." })
  .trim()
  .toLowerCase()
  .min(1, "El email es obligatorio.")
  .email("Ingresá un email válido.")
  .max(200, "El email es demasiado largo.");

// Contraseña nueva: mínimo 8 caracteres y no más de 72 bytes (límite de bcrypt). No se recorta.
export const passwordNueva = z
  .string({ required_error: "La contraseña es obligatoria.", invalid_type_error: "La contraseña debe ser un texto." })
  .min(PASSWORD_MINIMO, `La contraseña debe tener al menos ${PASSWORD_MINIMO} caracteres.`)
  .refine(
    (texto) => new TextEncoder().encode(texto).length <= PASSWORD_MAXIMO_BYTES,
    "La contraseña es demasiado larga.",
  );

// Booleano recibido en la query string: "true" | "false".
export const booleanoTexto = z
  .enum(["true", "false"], { errorMap: () => ({ message: "Debe ser true o false." }) })
  .transform((valor) => valor === "true");

// Id recibido como texto (ruta o query string). Solo dígitos: descarta "1e3", "0x10", " 1".
export const idTexto = z
  .string()
  .regex(/^[1-9]\d{0,9}$/, "El id debe ser un número entero positivo.")
  .transform(Number);

// Búsqueda libre: ausente o vacía significa "sin filtro".
export const textoBusqueda = z
  .string()
  .trim()
  .max(100, "La búsqueda es demasiado larga.")
  .optional()
  .transform((texto) => (texto ? texto : undefined));

// Paginación de la sección 11.1: page desde 1, pageSize por defecto 20 y máximo 100.
export const paginacion = z.object({
  page: z.coerce.number().int("La página debe ser un número entero.").min(1, "La página empieza en 1.").default(1),
  pageSize: z.coerce
    .number()
    .int("El tamaño de página debe ser un número entero.")
    .min(1, "El tamaño de página debe ser al menos 1.")
    .max(PAGINA_TAMANO_MAXIMO, `El tamaño de página no puede superar ${PAGINA_TAMANO_MAXIMO}.`)
    .default(PAGINA_TAMANO_POR_DEFECTO),
});

export type Paginacion = z.infer<typeof paginacion>;
export type Pagina<T> = { data: T[]; page: number; pageSize: number; total: number };
