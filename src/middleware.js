// Middleware: redirige a /login si no hay cookie de sesión.
// Es solo un filtro rápido: la verificación real (token vigente, usuario activo, rol) se hace en el
// servidor, en el layout del dashboard y en cada route handler.
import { NextResponse } from "next/server";
import { NOMBRE_COOKIE_SESION } from "@/lib/auth/cookie";

export function middleware(request) {
  if (request.cookies.has(NOMBRE_COOKIE_SESION)) return NextResponse.next();

  const url = request.nextUrl.clone();
  const desde = `${url.pathname}${url.search}`;
  url.pathname = "/login";
  url.search = "";
  if (desde !== "/") url.searchParams.set("desde", desde);
  return NextResponse.redirect(url);
}

// Pantallas protegidas. Quedan afuera: /login, la API (responde 401 por su cuenta) y los archivos estáticos.
export const config = {
  matcher: ["/((?!login|api|_next/static|_next/image|favicon.ico).*)"],
};
