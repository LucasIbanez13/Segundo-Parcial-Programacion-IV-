// Verificación de permisos en el servidor. Ocultar botones en el front no alcanza.
import { CODIGOS_ERROR, ErrorApi } from "@/lib/errors";
import { obtenerSesion } from "./session";

// Espera que obtenerSesion() devuelva { usuario } si la sesión es válida, o null si no lo es.
export async function requerirSesion() {
  const sesion = await obtenerSesion();

  if (!sesion?.usuario?.activo) {
    throw new ErrorApi(401, CODIGOS_ERROR.NO_AUTENTICADO, "Tu sesión no es válida. Volvé a ingresar.");
  }
  return sesion.usuario;
}

export async function requerirAdministrador() {
  const usuario = await requerirSesion();

  if (!usuario.administrador) {
    throw new ErrorApi(403, CODIGOS_ERROR.PROHIBIDO, "No tenés permiso para realizar esta operación.");
  }
  return usuario;
}

function obtenerHostDeOrigen(origen) {
  try {
    return new URL(origen).host;
  } catch {
    return null;
  }
}

// Para métodos que modifican datos. La comprobación es estricta: sin Origin, se rechaza.
// x-forwarded-host es el host público cuando la app corre detrás de un proxy, como en Vercel.
export function verificarOrigen(request) {
  const hostDeOrigen = obtenerHostDeOrigen(request.headers.get("origin"));
  const hostEsperado = request.headers.get("x-forwarded-host") ?? request.headers.get("host");

  if (!hostDeOrigen || hostDeOrigen !== hostEsperado) {
    throw new ErrorApi(403, CODIGOS_ERROR.PROHIBIDO, "El origen de la solicitud no está permitido.");
  }
}
