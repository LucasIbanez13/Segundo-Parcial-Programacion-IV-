// Manejo de sesión con tabla 'sesiones' + cookie HttpOnly (Secure en producción, SameSite=Lax).
// Este archivo solo lee y escribe la cookie; la lógica está en services/auth.service.js.
import { cookies } from "next/headers";
import { obtenerUsuarioDeSesion } from "@/services/auth.service";
import { NOMBRE_COOKIE_SESION } from "./cookie";

export async function leerTokenSesion() {
  const almacen = await cookies();
  return almacen.get(NOMBRE_COOKIE_SESION)?.value ?? null;
}

// Solo funciona en route handlers y server actions (los Server Components no pueden escribir cookies).
export async function guardarCookieSesion(token, expiraEn) {
  const almacen = await cookies();
  almacen.set(NOMBRE_COOKIE_SESION, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiraEn,
  });
}

export async function borrarCookieSesion() {
  const almacen = await cookies();
  almacen.delete(NOMBRE_COOKIE_SESION);
}

// Devuelve { usuario } si la sesión es válida y el usuario sigue activo, o null.
export async function obtenerSesion() {
  const usuario = await obtenerUsuarioDeSesion(await leerTokenSesion());
  return usuario ? { usuario } : null;
}
