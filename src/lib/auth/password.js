// Hash y verificación de contraseñas con bcryptjs (nunca texto plano).
import bcrypt from "bcryptjs";

// Mismo costo que usa el seed del primer administrador.
const RONDAS_BCRYPT = 12;

export function hashPassword(contrasena) {
  return bcrypt.hash(contrasena, RONDAS_BCRYPT);
}

export function verificarPassword(contrasena, hash) {
  return bcrypt.compare(contrasena, hash);
}

// Hash de relleno: si el acceso no existe igual se compara contra algo, así la respuesta tarda
// lo mismo y no se puede adivinar qué accesos existen midiendo el tiempo.
let hashDeRelleno;

export async function compararConRelleno(contrasena) {
  hashDeRelleno ??= bcrypt.hash("relleno-sin-usuario", RONDAS_BCRYPT);
  await bcrypt.compare(contrasena, await hashDeRelleno);
  return false;
}
