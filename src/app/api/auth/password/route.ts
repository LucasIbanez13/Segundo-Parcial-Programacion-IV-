// PUT /api/auth/password — ambos roles. RF-U5.
// Cuerpo { actual, nueva }. 204; 422 CONTRASENA_ACTUAL_INCORRECTA.
import { ruta, sinContenido } from "@/lib/http/ruta";
import { cambiarPassword } from "@/services/auth.service";

export const PUT = ruta(async ({ usuario, body }) => {
  await cambiarPassword(usuario, body);
  return sinContenido();
});
