// POST /api/clientes/:id/pagos -> registrar pago (importe > 0 y <= saldo, fecha no futura). 409 si supera el saldo.
// Contrato: docs/02-api-rest.md (Cuenta corriente y pagos)
import { NextResponse } from "next/server";
import { requerirSesion, verificarOrigen } from "@/lib/auth/permissions";
import { respuestaError } from "@/lib/errors";
import { registrarPagoSchema } from "@/lib/validations/pago";
import { leerIdDeRuta, leerJson, validar } from "@/lib/validations/solicitud";
import { registrarPago } from "@/services/cuentaCorriente.service";

export async function POST(request, { params }) {
  try {
    verificarOrigen(request);
    const usuario = await requerirSesion();

    const { id } = await params;
    const clienteId = leerIdDeRuta(id, "El cliente no existe.");
    const datos = validar(registrarPagoSchema, await leerJson(request));

    // No hay ruta individual de pago, así que no se devuelve Location.
    return NextResponse.json(await registrarPago(clienteId, datos, usuario), { status: 201 });
  } catch (error) {
    return respuestaError(error);
  }
}
