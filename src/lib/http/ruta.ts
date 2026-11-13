// Envoltorio común de los Route Handlers (sección 10.3).
// Exige la sesión, controla el origen, resuelve los parámetros, lee el JSON y convierte cualquier
// error al formato estándar { error: { code, message, details } }. Cada ruta queda en pocas líneas:
// llamar al servicio y responder. Acá NO hay reglas de negocio ni validaciones de datos.
import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { exigirSesion } from "@/lib/auth/sesion";
import type { UsuarioSesion } from "@/lib/auth/permisos";
import { ApiError, normalizarError } from "@/lib/errors";

type Contexto<P> = { params: Promise<P> };

type Entrada<P, Publica extends boolean> = {
  request: NextRequest;
  params: P;
  // Query string como objeto plano; el servicio la valida con su esquema.
  query: Record<string, string>;
  // Cuerpo JSON sin validar (undefined en GET).
  body: unknown;
  usuario: Publica extends true ? null : UsuarioSesion;
};

type Opciones<Publica extends boolean> = { publica?: Publica };

const METODOS_SIN_CUERPO = new Set(["GET", "HEAD"]);

// Protección CSRF básica (además de SameSite=Lax): en métodos que modifican datos, si el navegador
// manda Origin tiene que ser este mismo sitio. Los navegadores siempre lo envían en pedidos entre sitios;
// herramientas como curl o Postman no lo mandan y pasan (igual necesitan una cookie de sesión válida).
// x-forwarded-host es el host público cuando la app corre detrás de un proxy, como en Vercel.
function verificarOrigen(request: NextRequest) {
  const origen = request.headers.get("origin");
  if (!origen) return;
  const hostEsperado = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  let hostDeOrigen: string | null = null;
  try {
    hostDeOrigen = new URL(origen).host;
  } catch {
    hostDeOrigen = null;
  }
  if (hostDeOrigen !== hostEsperado) {
    throw new ApiError(403, "SIN_PERMISO", "El origen de la solicitud no está permitido.");
  }
}

async function leerJson(request: NextRequest): Promise<unknown> {
  const texto = await request.text();
  if (texto.trim() === "") return {};
  try {
    return JSON.parse(texto);
  } catch {
    throw new ApiError(400, "JSON_INVALIDO", "El cuerpo de la solicitud no es un JSON válido.");
  }
}

export function ruta<P = Record<string, never>, Publica extends boolean = false>(
  manejador: (entrada: Entrada<P, Publica>) => Promise<Response | unknown>,
  opciones: Opciones<Publica> = {},
) {
  return async (request: NextRequest, contexto: Contexto<P>): Promise<Response> => {
    try {
      const conCuerpo = !METODOS_SIN_CUERPO.has(request.method);
      if (conCuerpo) verificarOrigen(request);

      const usuario = opciones.publica ? null : await exigirSesion();
      const params = ((await contexto?.params) ?? {}) as P;
      const query = Object.fromEntries(request.nextUrl.searchParams);
      const body = conCuerpo ? await leerJson(request) : undefined;

      const resultado = await manejador({ request, params, query, body, usuario } as Entrada<P, Publica>);
      return resultado instanceof Response ? resultado : NextResponse.json(resultado);
    } catch (error) {
      const { status, cuerpo } = normalizarError(error);
      return NextResponse.json({ error: cuerpo }, { status });
    }
  };
}

// 201 Created con header Location.
export function creado(datos: unknown, location?: string): Response {
  return NextResponse.json(datos, { status: 201, headers: location ? { Location: location } : undefined });
}

// 204 No Content.
export function sinContenido(): Response {
  return new NextResponse(null, { status: 204 });
}
