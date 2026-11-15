// Proxy de Next.js: primera barrera de la sección 10.5.
// Si falta la cookie firmada (o su firma no es válida o venció) redirige a /login.
// Es un filtro rápido: no consulta la base. La segunda barrera es cada página (getCurrentUser)
// y la tercera, cada servicio, que verifica el rol.
import { NextResponse, type NextRequest } from "next/server";
import { verificarToken } from "@/lib/auth/token";
import { NOMBRE_COOKIE_SESION } from "@/lib/constants";

export async function middleware(request: NextRequest) {
  const usuarioId = await verificarToken(request.cookies.get(NOMBRE_COOKIE_SESION)?.value);
  if (usuarioId !== null) return NextResponse.next();

  const url = request.nextUrl.clone();
  const desde = `${url.pathname}${url.search}`;
  url.pathname = "/login";
  url.search = "";
  if (desde !== "/") url.searchParams.set("desde", desde);
  return NextResponse.redirect(url);
}

// Páginas protegidas: todo salvo /login (única pública), la API (responde 401 por su cuenta)
// y los archivos estáticos.
export const config = {
  matcher: ["/((?!login|api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|ico)$).*)"],
};
