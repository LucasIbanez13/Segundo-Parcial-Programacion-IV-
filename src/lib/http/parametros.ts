// Lectura de parámetros de ruta. Un id que no es un entero positivo no puede existir: 404.
import { errores } from "@/lib/errors";
import { idTexto } from "@/lib/schemas/comun";

export function leerId(valor: string | undefined, recurso: string): number {
  const resultado = idTexto.safeParse(valor);
  if (!resultado.success) throw errores.noEncontrado(recurso);
  return resultado.data;
}
