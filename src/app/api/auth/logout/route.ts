// POST /api/auth/logout — ambos roles. RF-U1. 204 y borra la cookie.
import { borrarCookieSesion } from "@/lib/auth/sesion";
import { ruta, sinContenido } from "@/lib/http/ruta";

export const POST = ruta(async () => {
  await borrarCookieSesion();
  return sinContenido();
});
