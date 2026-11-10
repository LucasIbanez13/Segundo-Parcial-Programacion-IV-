// GET   /api/clientes/:id -> consultar cliente (con saldoCentavos).
// PATCH /api/clientes/:id -> modificar nombre, documento, telefono, correo.
// Contrato: docs/02-api-rest.md (Clientes)
import { NextResponse } from "next/server";
import { requerirSesion, verificarOrigen } from "@/lib/auth/permissions";
import { respuestaError } from "@/lib/errors";
import { actualizarClienteSchema } from "@/lib/validations/cliente";
import { leerIdDeRuta, leerJson, validar } from "@/lib/validations/solicitud";
import { modificarCliente, obtenerCliente } from "@/services/clientes.service";

const MENSAJE_NO_ENCONTRADO = "El cliente no existe.";

export async function GET(_request, { params }) {
  try {
    await requerirSesion();

    const { id } = await params;
    const cliente = await obtenerCliente(leerIdDeRuta(id, MENSAJE_NO_ENCONTRADO));

    return NextResponse.json(cliente);
  } catch (error) {
    return respuestaError(error);
  }
}

export async function PATCH(request, { params }) {
  try {
    verificarOrigen(request);
    await requerirSesion();

    const { id } = await params;
    const clienteId = leerIdDeRuta(id, MENSAJE_NO_ENCONTRADO);
    const cambios = validar(actualizarClienteSchema, await leerJson(request));

    return NextResponse.json(await modificarCliente(clienteId, cambios));
  } catch (error) {
    return respuestaError(error);
  }
}
