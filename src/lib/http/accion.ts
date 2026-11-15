// Envoltorio común de las Server Actions (sección 10.3).
// Exige la sesión, llama al servicio y devuelve { ok: true, data } o { ok: false, error } en lugar de
// lanzar, para que el formulario muestre el error junto al campo. Mismos servicios que las rutas REST.
import "server-only";
import { exigirSesion } from "@/lib/auth/sesion";
import type { UsuarioSesion } from "@/lib/auth/permisos";
import { normalizarError } from "@/lib/errors";
import type { ResultadoAccion } from "./resultado";

export function accion<A extends unknown[], R>(
  manejador: (usuario: UsuarioSesion, ...argumentos: A) => Promise<R>,
) {
  return async (...argumentos: A): Promise<ResultadoAccion<R>> => {
    try {
      const usuario = await exigirSesion();
      return { ok: true, data: await manejador(usuario, ...argumentos) };
    } catch (error) {
      return { ok: false, error: normalizarError(error).cuerpo };
    }
  };
}
