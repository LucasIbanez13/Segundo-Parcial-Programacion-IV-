// GET  /api/ventas -> listado de ventas.
// POST /api/ventas -> confirmar venta (una transacción: comprobante + detalles + stock + movimientos).
// Contrato: docs/02-api-rest.md (Ventas y comprobantes)
import { NextResponse } from "next/server";
import { requerirSesion, verificarOrigen } from "@/lib/auth/permissions";
import { respuestaError } from "@/lib/errors";
import { leerJson, validar } from "@/lib/validations/solicitud";
import { crearVentaSchema } from "@/lib/validations/venta";
import { listarVentas, registrarVenta } from "@/services/ventas.service";

export async function GET() {
  try {
    await requerirSesion();

    return NextResponse.json({ datos: await listarVentas() });
  } catch (error) {
    return respuestaError(error);
  }
}

export async function POST(request) {
  try {
    verificarOrigen(request);
    const usuario = await requerirSesion();

    const datos = validar(crearVentaSchema, await leerJson(request));
    const venta = await registrarVenta(datos, usuario);

    return NextResponse.json(venta, {
      status: 201,
      headers: { Location: `/api/ventas/${venta.id}` },
    });
  } catch (error) {
    return respuestaError(error);
  }
}
