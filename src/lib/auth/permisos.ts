// Verificación de rol dentro de los servicios (sección 10.5: "cada servicio verifica el rol").
// Ocultar un botón es solo una ayuda visual: el permiso lo decide siempre el servidor.
import type { Rol } from "@/lib/constants";
import { errores } from "@/lib/errors";

// Usuario autenticado tal como lo reciben los servicios. Nunca incluye el hash de contraseña.
export type UsuarioSesion = { id: number; nombre: string; email: string; rol: Rol };

// Lanza 403 SIN_PERMISO si el rol del usuario no está entre los permitidos.
export function exigirRol(usuario: UsuarioSesion, ...roles: Rol[]): void {
  if (!roles.includes(usuario.rol)) throw errores.sinPermiso();
}

export function esAdmin(usuario: Pick<UsuarioSesion, "rol"> | null | undefined): boolean {
  return usuario?.rol === "admin";
}
