// GET   /api/productos/{id} — ambos roles. RF-P1. 404 si no existe.
// PATCH /api/productos/{id} — admin. RF-P2, RF-P3. 200; 409 CODIGO_DUPLICADO; 422 si llega existencia.
import { leerId } from "@/lib/http/parametros";
import { ruta } from "@/lib/http/ruta";
import { editarProducto, obtenerProducto } from "@/services/productos.service";

export const GET = ruta<{ id: string }>(async ({ usuario, params }) =>
  obtenerProducto(usuario, leerId(params.id, "El producto")),
);

export const PATCH = ruta<{ id: string }>(async ({ usuario, params, body }) =>
  editarProducto(usuario, leerId(params.id, "El producto"), body),
);
