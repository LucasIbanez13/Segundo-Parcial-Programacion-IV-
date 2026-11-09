// GET   /api/productos/:id -> consultar producto.
// PATCH /api/productos/:id -> modificar codigo, nombre, precioVentaCentavos, activo (nunca el stock).
// Contrato: docs/02-api-rest.md (Productos)
import { NextResponse } from "next/server";
import { requerirSesion, verificarOrigen } from "@/lib/auth/permissions";
import { respuestaError } from "@/lib/errors";
import { actualizarProductoSchema } from "@/lib/validations/producto";
import { leerIdDeRuta, leerJson, validar } from "@/lib/validations/solicitud";
import { actualizarProducto, obtenerProducto } from "@/services/productos.service";

const MENSAJE_NO_ENCONTRADO = "El producto no existe.";

export async function GET(_request, { params }) {
  try {
    await requerirSesion();

    const { id } = await params;
    const producto = await obtenerProducto(leerIdDeRuta(id, MENSAJE_NO_ENCONTRADO));

    return NextResponse.json(producto);
  } catch (error) {
    return respuestaError(error);
  }
}

export async function PATCH(request, { params }) {
  try {
    verificarOrigen(request);
    await requerirSesion();

    const { id } = await params;
    const productoId = leerIdDeRuta(id, MENSAJE_NO_ENCONTRADO);
    const cambios = validar(actualizarProductoSchema, await leerJson(request));

    return NextResponse.json(await actualizarProducto(productoId, cambios));
  } catch (error) {
    return respuestaError(error);
  }
}
