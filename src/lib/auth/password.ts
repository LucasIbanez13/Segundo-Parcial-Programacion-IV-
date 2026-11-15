// Hash y verificación de contraseñas con bcrypt (sección 8: nunca en texto plano).
import "server-only";
import bcrypt from "bcryptjs";
import { randomInt } from "node:crypto";

const RONDAS_BCRYPT = 12;

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, RONDAS_BCRYPT);
}

export function verificarPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Si el email no existe igual se compara contra un hash de relleno: la respuesta tarda lo mismo
// y no se puede averiguar qué emails están registrados midiendo el tiempo.
let hashDeRelleno: Promise<string> | null = null;

export async function compararConRelleno(password: string): Promise<false> {
  hashDeRelleno ??= bcrypt.hash("relleno-sin-usuario", RONDAS_BCRYPT);
  await bcrypt.compare(password, await hashDeRelleno);
  return false;
}

// Contraseña temporal para el restablecimiento (RF-U5). Sin caracteres que se confundan (0/O, 1/l/I).
const ALFABETO = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function generarPasswordTemporal(largo = 12): string {
  let password = "";
  for (let i = 0; i < largo; i++) password += ALFABETO[randomInt(ALFABETO.length)];
  return password;
}
