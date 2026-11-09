// GET  /api/productos?q=&activo= -> listado / búsqueda por nombre o código.
// POST /api/productos            -> alta (stockInicial > 0 -> movimiento INICIAL en la misma transacción).
// Contrato: docs/02-api-rest.md (Productos)
import { NextResponse } from "next/server";
import { requerirSesion, verificarOrigen } from "@/lib/auth/permissions";
import { respuestaError } from "@/lib/errors";
import { crearProductoSchema, filtrosProductosSchema } from "@/lib/validations/producto";
import { leerJson, validar } from "@/lib/validations/solicitud";
import { crearProducto, listarProductos } from "@/services/productos.service";

export async function GET(request) {
  try {
    await requerirSesion();

    const parametros = Object.fromEntries(new URL(request.url).searchParams);
    const filtros = validar(filtrosProductosSchema, parametros);

    return NextResponse.json({ datos: await listarProductos(filtros) });
  } catch (error) {
    return respuestaError(error);
  }
}

export async function POST(request) {
  try {
    verificarOrigen(request);
    const usuario = await requerirSesion();

    const datos = validar(crearProductoSchema, await leerJson(request));
    const producto = await crearProducto(datos, usuario);

    return NextResponse.json(producto, {
      status: 201,
      headers: { Location: `/api/productos/${producto.id}` },
    });
  } catch (error) {
    return respuestaError(error);
  }
}
