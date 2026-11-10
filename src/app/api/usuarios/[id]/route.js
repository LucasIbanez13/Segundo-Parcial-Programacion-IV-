// GET   /api/usuarios/:id -> consultar (solo administrador).
// PATCH /api/usuarios/:id -> editar nombre, acceso, administrador, activo (solo administrador).
// 409 si se desactiva o se quita admin al último administrador activo.
// Contrato: docs/02-api-rest.md (Sesión y usuarios)
import { NextResponse } from "next/server";
import { requerirAdministrador, verificarOrigen } from "@/lib/auth/permissions";
import { respuestaError } from "@/lib/errors";
import { leerIdDeRuta, leerJson, validar } from "@/lib/validations/solicitud";
import { actualizarUsuarioSchema } from "@/lib/validations/usuario";
import { modificarUsuario, obtenerUsuario } from "@/services/usuarios.service";

const MENSAJE_NO_ENCONTRADO = "El usuario no existe.";

export async function GET(_request, { params }) {
  try {
    await requerirAdministrador();

    const { id } = await params;
    return NextResponse.json(await obtenerUsuario(leerIdDeRuta(id, MENSAJE_NO_ENCONTRADO)));
  } catch (error) {
    return respuestaError(error);
  }
}

export async function PATCH(request, { params }) {
  try {
    verificarOrigen(request);
    await requerirAdministrador();

    const { id } = await params;
    const usuarioId = leerIdDeRuta(id, MENSAJE_NO_ENCONTRADO);
    const cambios = validar(actualizarUsuarioSchema, await leerJson(request));

    return NextResponse.json(await modificarUsuario(usuarioId, cambios));
  } catch (error) {
    return respuestaError(error);
  }
}
