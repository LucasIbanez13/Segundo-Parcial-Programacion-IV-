// GET /api/clientes/:id/cuenta-corriente -> saldoCentavos y movimientos (VENTA / PAGO).
// Contrato: docs/02-api-rest.md (Cuenta corriente y pagos)
import { NextResponse } from "next/server";
import { requerirSesion } from "@/lib/auth/permissions";
import { respuestaError } from "@/lib/errors";
import { leerIdDeRuta } from "@/lib/validations/solicitud";
import { obtenerCuentaCorriente } from "@/services/cuentaCorriente.service";

export async function GET(_request, { params }) {
  try {
    await requerirSesion();

    const { id } = await params;
    const clienteId = leerIdDeRuta(id, "El cliente no existe.");

    return NextResponse.json(await obtenerCuentaCorriente(clienteId));
  } catch (error) {
    return respuestaError(error);
  }
}
