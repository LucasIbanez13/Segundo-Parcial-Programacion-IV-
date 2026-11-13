// Sesión propia en cookie firmada (sección 9, "Autenticación").
// Lee y escribe la cookie; quién es el usuario lo resuelve auth.service contra la base de datos.
import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import { DURACION_SESION_MS, NOMBRE_COOKIE_SESION } from "@/lib/constants";
import { errores } from "@/lib/errors";
import { obtenerUsuarioPorSesion } from "@/services/auth.service";
import type { UsuarioSesion } from "./permisos";
import { firmarToken, verificarToken } from "./token";

// Solo en Route Handlers y Server Actions: los Server Components no pueden escribir cookies.
export async function guardarCookieSesion(usuarioId: number): Promise<void> {
  const expiraEn = new Date(Date.now() + DURACION_SESION_MS);
  const almacen = await cookies();
  almacen.set(NOMBRE_COOKIE_SESION, await firmarToken(usuarioId, expiraEn), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiraEn,
  });
}

export async function borrarCookieSesion(): Promise<void> {
  const almacen = await cookies();
  almacen.delete(NOMBRE_COOKIE_SESION);
}

// RF-U2 y sección 10.5: verifica la firma de la cookie y consulta la base de datos EN CADA PEDIDO.
// Un usuario borrado o desactivado pierde el acceso de inmediato, aunque conserve la cookie, y un
// cambio de rol se aplica en el pedido siguiente. `cache` evita repetir la consulta dentro del mismo render.
export const getCurrentUser = cache(async (): Promise<UsuarioSesion | null> => {
  const almacen = await cookies();
  const usuarioId = await verificarToken(almacen.get(NOMBRE_COOKIE_SESION)?.value);
  if (usuarioId === null) return null;
  return obtenerUsuarioPorSesion(usuarioId);
});

// Igual que getCurrentUser, pero lanza 401 NO_AUTENTICADO si no hay usuario válido.
export async function exigirSesion(): Promise<UsuarioSesion> {
  const usuario = await getCurrentUser();
  if (!usuario) throw errores.noAutenticado();
  return usuario;
}
