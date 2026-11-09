// GET  /api/movimientos-stock?productoId= -> historial (origen INICIAL | MANUAL | VENTA).
// POST /api/movimientos-stock             -> entrada / salida MANUAL (transacción, 409 si no alcanza el stock).
// Contrato: docs/02-api-rest.md (Movimientos de stock)
import { NextResponse } from "next/server";
import { requerirSesion, verificarOrigen } from "@/lib/auth/permissions";
import { respuestaError } from "@/lib/errors";
import { crearMovimientoSchema, filtrosMovimientosSchema } from "@/lib/validations/movimientoStock";
import { leerJson, validar } from "@/lib/validations/solicitud";
import { listarMovimientos, registrarMovimiento } from "@/services/stock.service";

export async function GET(request) {
  try {
    await requerirSesion();

    const parametros = Object.fromEntries(new URL(request.url).searchParams);
    const filtros = validar(filtrosMovimientosSchema, parametros);

    return NextResponse.json({ datos: await listarMovimientos(filtros) });
  } catch (error) {
    return respuestaError(error);
  }
}

export async function POST(request) {
  try {
    verificarOrigen(request);
    const usuario = await requerirSesion();

    const datos = validar(crearMovimientoSchema, await leerJson(request));

    // No hay ruta individual de movimientos, por eso no lleva header Location.
    return NextResponse.json(await registrarMovimiento(datos, usuario), { status: 201 });
  } catch (error) {
    return respuestaError(error);
  }
}
