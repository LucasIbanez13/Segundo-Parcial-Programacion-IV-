// Piezas zod reutilizables. Sin dependencias del servidor: también se pueden usar en el front.
import { z } from "zod";

// Máximo de una columna integer de PostgreSQL. Validarlo acá evita que un valor enorme
// llegue a la BD y termine en un error 500 en lugar de un 422.
export const MAXIMO_ENTERO_BD = 2_147_483_647;

// PostgreSQL no admite el carácter NUL en columnas text.
const SIN_CARACTER_NUL = /^[^\0]*$/;

// Texto obligatorio: no puede quedar vacío después de trim().
export function textoObligatorio(etiqueta) {
  return z
    .string({
      required_error: `${etiqueta} es obligatorio.`,
      invalid_type_error: `${etiqueta} debe ser un texto.`,
    })
    .trim()
    .min(1, `${etiqueta} es obligatorio.`)
    .regex(SIN_CARACTER_NUL, `${etiqueta} contiene caracteres inválidos.`);
}

// Entero dentro del rango de la BD. No convierte: "10" o 10.5 se rechazan.
export function entero(etiqueta) {
  return z
    .number({
      required_error: `${etiqueta} es obligatorio.`,
      invalid_type_error: `${etiqueta} debe ser un número.`,
    })
    .int(`${etiqueta} debe ser un número entero.`)
    .max(MAXIMO_ENTERO_BD, `${etiqueta} supera el máximo permitido.`);
}

export function enteroPositivo(etiqueta) {
  return entero(etiqueta).positive(`${etiqueta} debe ser mayor a cero.`);
}

export function booleano(etiqueta) {
  return z.boolean({
    required_error: `${etiqueta} es obligatorio.`,
    invalid_type_error: `${etiqueta} debe ser verdadero o falso.`,
  });
}

// Id recibido como texto (ruta o query string). Solo acepta dígitos: descarta "1e3", "0x10", " 1".
export const idTexto = z
  .string()
  .regex(/^[1-9]\d*$/, "El id debe ser un número entero positivo.")
  .transform(Number)
  .refine((id) => id <= MAXIMO_ENTERO_BD, "El id supera el máximo permitido.");

// Parámetro de búsqueda `q`: ausente o vacío significa "sin filtro".
export const textoBusqueda = z
  .string()
  .transform((texto) => texto.replaceAll("\0", "").trim())
  .optional();
