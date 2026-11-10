// GET  /api/usuarios?q= -> listado (solo administrador).
// POST /api/usuarios     -> alta (solo administrador). 409 si el acceso está duplicado.
// Contrato: docs/02-api-rest.md (Sesión y usuarios)
import { NextResponse } from "next/server";
import { requerirAdministrador, verificarOrigen } from "@/lib/auth/permissions";
import { respuestaError } from "@/lib/errors";
import { leerJson, validar } from "@/lib/validations/solicitud";
import { crearUsuarioSchema, filtrosUsuariosSchema } from "@/lib/validations/usuario";
import { crearUsuario, listarUsuarios } from "@/services/usuarios.service";

export async function GET(request) {
  try {
    await requerirAdministrador();

    const parametros = Object.fromEntries(new URL(request.url).searchParams);
    const filtros = validar(filtrosUsuariosSchema, parametros);

    return NextResponse.json({ datos: await listarUsuarios(filtros) });
  } catch (error) {
    return respuestaError(error);
  }
}

export async function POST(request) {
  try {
    verificarOrigen(request);
    await requerirAdministrador();

    const datos = validar(crearUsuarioSchema, await leerJson(request));
    const usuario = await crearUsuario(datos);

    return NextResponse.json(usuario, {
      status: 201,
      headers: { Location: `/api/usuarios/${usuario.id}` },
    });
  } catch (error) {
    return respuestaError(error);
  }
}
