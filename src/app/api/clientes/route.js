// GET  /api/clientes?q= -> listado / búsqueda por nombre o documento (incluye saldoCentavos).
// POST /api/clientes     -> alta de cliente (al menos un contacto).
// Contrato: docs/02-api-rest.md (Clientes)
import { NextResponse } from "next/server";
import { requerirSesion, verificarOrigen } from "@/lib/auth/permissions";
import { respuestaError } from "@/lib/errors";
import { crearClienteSchema, filtrosClientesSchema } from "@/lib/validations/cliente";
import { leerJson, validar } from "@/lib/validations/solicitud";
import { crearCliente, listarClientes } from "@/services/clientes.service";

export async function GET(request) {
  try {
    await requerirSesion();

    const parametros = Object.fromEntries(new URL(request.url).searchParams);
    const filtros = validar(filtrosClientesSchema, parametros);

    return NextResponse.json({ datos: await listarClientes(filtros) });
  } catch (error) {
    return respuestaError(error);
  }
}

export async function POST(request) {
  try {
    verificarOrigen(request);
    await requerirSesion();

    const datos = validar(crearClienteSchema, await leerJson(request));
    const cliente = await crearCliente(datos);

    return NextResponse.json(cliente, {
      status: 201,
      headers: { Location: `/api/clientes/${cliente.id}` },
    });
  } catch (error) {
    return respuestaError(error);
  }
}
