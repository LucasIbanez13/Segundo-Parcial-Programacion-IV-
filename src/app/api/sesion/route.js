// POST   /api/sesion -> iniciar sesión (acceso + contrasena). 401 si es inválido o inactivo.
// GET    /api/sesion -> usuario de la sesión actual o 401.
// DELETE /api/sesion -> cerrar sesión (204).
// Contrato: docs/02-api-rest.md (Sesión y usuarios)
import { NextResponse } from "next/server";
import { requerirSesion, verificarOrigen } from "@/lib/auth/permissions";
import { borrarCookieSesion, guardarCookieSesion, leerTokenSesion } from "@/lib/auth/session";
import { respuestaError } from "@/lib/errors";
import { iniciarSesionSchema } from "@/lib/validations/sesion";
import { leerJson, validar } from "@/lib/validations/solicitud";
import { cerrarSesion, iniciarSesion } from "@/services/auth.service";

export async function POST(request) {
  try {
    verificarOrigen(request);

    const credenciales = validar(iniciarSesionSchema, await leerJson(request));
    const { token, expiraEn, usuario } = await iniciarSesion(credenciales, await leerTokenSesion());

    await guardarCookieSesion(token, expiraEn);
    return NextResponse.json({ usuario });
  } catch (error) {
    return respuestaError(error);
  }
}

export async function GET() {
  try {
    const usuario = await requerirSesion();
    return NextResponse.json({ usuario });
  } catch (error) {
    return respuestaError(error);
  }
}

export async function DELETE(request) {
  try {
    verificarOrigen(request);
    await requerirSesion();

    await cerrarSesion(await leerTokenSesion());
    await borrarCookieSesion();
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    // Aunque la sesión ya no sea válida, se limpia la cookie del navegador.
    await borrarCookieSesion();
    return respuestaError(error);
  }
}
