// GET  /api/productos — ambos roles. RF-P1. q, categoriaId, bajoMinimo, activo y paginación.
// POST /api/productos — admin. RF-P2. 201; 409 CODIGO_DUPLICADO. stockInicial se graba como ingreso.
import { creado, ruta } from "@/lib/http/ruta";
import { crearProducto, listarProductos } from "@/services/productos.service";

export const GET = ruta(async ({ usuario, query }) => listarProductos(usuario, query));

export const POST = ruta(async ({ usuario, body }) => {
  const nuevo = await crearProducto(usuario, body);
  return creado(nuevo, `/api/productos/${nuevo.id}`);
});
