// GET /api/ventas/:id -> comprobante completo (desde las copias históricas).
// Contrato: docs/02-api-rest.md (Ventas y comprobantes)
import { NextResponse } from "next/server";
import { requerirSesion } from "@/lib/auth/permissions";
import { respuestaError } from "@/lib/errors";
import { leerIdDeRuta } from "@/lib/validations/solicitud";
import { obtenerVenta } from "@/services/ventas.service";

export async function GET(_request, { params }) {
  try {
    await requerirSesion();

    const { id } = await params;
    const venta = await obtenerVenta(leerIdDeRuta(id, "La venta no existe."));

    return NextResponse.json(venta);
  } catch (error) {
    return respuestaError(error);
  }
}
