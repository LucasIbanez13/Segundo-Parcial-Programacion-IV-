// Lógica de autenticación: verificar credenciales, crear/validar/cerrar sesiones.
// No conoce Request/Response ni cookies: eso lo maneja src/lib/auth/session.js.
import { randomBytes } from "node:crypto";
import { db } from "@/db";
import { CODIGOS_ERROR, ErrorApi } from "@/lib/errors";
import { compararConRelleno, verificarPassword } from "@/lib/auth/password";
import {
  buscarSesionVigenteConUsuario,
  eliminarSesion,
  eliminarSesionesDeUsuario,
  eliminarSesionesVencidas,
  insertarSesion,
} from "@/repositories/sesiones.repository";
import { buscarUsuarioConClavePorAcceso } from "@/repositories/usuarios.repository";

// Duración de una sesión. Después hay que volver a ingresar.
export const DURACION_SESION_MS = 8 * 60 * 60 * 1000;

// Token de 32 bytes aleatorios en hexadecimal (64 caracteres).
const FORMATO_TOKEN = /^[0-9a-f]{64}$/;

function datosPublicos({ id, nombre, acceso, administrador, activo }) {
  return { id, nombre, acceso, administrador, activo };
}

// Verifica acceso y contraseña y crea una sesión nueva. Devuelve { token, expiraEn, usuario }.
// `tokenAnterior`: la sesión que tuviera abierta el navegador se descarta (la sesión se renueva).
export async function iniciarSesion({ acceso, contrasena }, tokenAnterior = null) {
  const usuario = await buscarUsuarioConClavePorAcceso(acceso);

  const contrasenaCorrecta = usuario
    ? await verificarPassword(contrasena, usuario.claveHash)
    : await compararConRelleno(contrasena);

  if (!contrasenaCorrecta) {
    throw new ErrorApi(401, CODIGOS_ERROR.CREDENCIALES_INVALIDAS, "El acceso o la contraseña no son correctos.");
  }

  // Solo se informa que está inactivo cuando la contraseña es correcta.
  if (!usuario.activo) {
    throw new ErrorApi(
      401,
      CODIGOS_ERROR.CREDENCIALES_INVALIDAS,
      "Tu usuario está inactivo. Pedile a un administrador que lo active para poder ingresar.",
    );
  }

  const token = randomBytes(32).toString("hex");
  const expiraEn = new Date(Date.now() + DURACION_SESION_MS);

  await db.transaction(async (tx) => {
    if (tokenAnterior && FORMATO_TOKEN.test(tokenAnterior)) {
      await eliminarSesion(tokenAnterior, tx);
    }
    await eliminarSesionesVencidas(tx);
    await insertarSesion({ id: token, usuarioId: usuario.id, expiraEn }, tx);
  });

  return { token, expiraEn, usuario: datosPublicos(usuario) };
}

// Usuario de una sesión vigente, o null. Se verifica en CADA solicitud que siga activo:
// si lo desactivaron, se borran sus sesiones y deja de tener acceso aunque tuviera una abierta.
export async function obtenerUsuarioDeSesion(token) {
  if (!token || !FORMATO_TOKEN.test(token)) return null;

  const sesion = await buscarSesionVigenteConUsuario(token);
  if (!sesion) return null;

  if (!sesion.usuario.activo) {
    await eliminarSesionesDeUsuario(sesion.usuario.id);
    return null;
  }

  return sesion.usuario;
}

export async function cerrarSesion(token) {
  if (!token || !FORMATO_TOKEN.test(token)) return;
  await eliminarSesion(token);
}
