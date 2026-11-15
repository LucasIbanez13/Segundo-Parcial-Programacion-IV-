// Ejecuta un esquema de Zod y, si falla, lanza ApiError 422 VALIDACION con el detalle por campo.
// Lo usan los servicios (sección 10.2: cada función valida primero con el esquema).
import type { z } from "zod";
import { ApiError, type DetalleCampo } from "@/lib/errors";

// Convierte los problemas de Zod a [{ campo, mensaje }]: el formato de details de la sección 11.1.
export function detallesDeZod(error: z.ZodError): DetalleCampo[] {
  return error.issues.map((problema) => ({
    campo:
      problema.path.join(".") || (problema.code === "unrecognized_keys" ? problema.keys.join(", ") : ""),
    mensaje: problema.message,
  }));
}

export function validar<T extends z.ZodTypeAny>(esquema: T, datos: unknown): z.output<T> {
  const resultado = esquema.safeParse(datos);
  if (resultado.success) return resultado.data;
  throw new ApiError(422, "VALIDACION", "Hay campos con errores.", detallesDeZod(resultado.error));
}
