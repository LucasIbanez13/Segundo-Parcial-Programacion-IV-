// Servicio de autenticación (sección 10.2). No conoce HTTP ni cookies: eso lo hacen los adaptadores.
// Cada función valida con el esquema, verifica el permiso, aplica las reglas y devuelve la forma pública.
import "server-only";
import type { UsuarioSesion } from "@/lib/auth/permisos";
import { compararConRelleno, hashPassword, verificarPassword } from "@/lib/auth/password";
import { ApiError } from "@/lib/errors";
import { cambiarPasswordSchema, loginSchema } from "@/lib/schemas/auth";
import { validar } from "@/lib/schemas/validar";
import * as usuariosRepo from "@/repositories/usuarios.repository";

// Forma pública del usuario conectado (sección 11.3): { id, nombre, email, rol }.
function aUsuarioSesion(fila: { id: number; nombre: string; email: string; rol: UsuarioSesion["rol"] }): UsuarioSesion {
  return { id: fila.id, nombre: fila.nombre, email: fila.email, rol: fila.rol };
}

// RF-U1, RF-U4 (un usuario desactivado no puede entrar).
// Email inexistente, contraseña incorrecta o usuario inactivo responden EXACTAMENTE el mismo error:
// así no se puede averiguar qué emails existen ni cuáles están desactivados.
export async function iniciarSesion(datos: unknown): Promise<UsuarioSesion> {
  const { email, password } = validar(loginSchema, datos);
  const usuario = await usuariosRepo.buscarConHashPorEmail(email);

  const passwordCorrecta = usuario
    ? await verificarPassword(password, usuario.passwordHash)
    : await compararConRelleno(password);

  if (!usuario || !passwordCorrecta || !usuario.activo) {
    throw new ApiError(401, "CREDENCIALES_INVALIDAS", "El email o la contraseña no son correctos.");
  }
  return aUsuarioSesion(usuario);
}

// RF-U2, sección 10.5: resuelve el usuario de la cookie contra la base de datos en cada pedido.
// Devuelve null si ya no existe o está desactivado: pierde el acceso aunque conserve la cookie.
export async function obtenerUsuarioPorSesion(usuarioId: number): Promise<UsuarioSesion | null> {
  const usuario = await usuariosRepo.buscarPorId(usuarioId);
  if (!usuario || !usuario.activo) return null;
  return aUsuarioSesion(usuario);
}

// RF-U5: cada usuario (admin o vendedor) cambia su propia contraseña verificando la actual.
export async function cambiarPassword(usuario: UsuarioSesion, datos: unknown): Promise<void> {
  const { actual, nueva } = validar(cambiarPasswordSchema, datos);

  const fila = await usuariosRepo.buscarConHashPorId(usuario.id);
  if (!fila) throw new ApiError(401, "NO_AUTENTICADO", "Tu sesión no es válida. Volvé a ingresar.");

  if (!(await verificarPassword(actual, fila.passwordHash))) {
    throw new ApiError(422, "CONTRASENA_ACTUAL_INCORRECTA", "La contraseña actual no es correcta.", [
      { campo: "actual", mensaje: "La contraseña actual no es correcta." },
    ]);
  }

  await usuariosRepo.actualizar(usuario.id, { passwordHash: await hashPassword(nueva) });
}
