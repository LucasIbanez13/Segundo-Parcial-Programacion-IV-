// GET  /api/productos/{id}/movimientos — ambos roles. RF-P6. Historial paginado, del más nuevo al más viejo.
// POST /api/productos/{id}/movimientos — admin. RF-P4, RF-P5. 201; 409 STOCK_INSUFICIENTE.
import { leerId } from "@/lib/http/parametros";
import { creado, ruta } from "@/lib/http/ruta";
import { listarMovimientosProducto, registrarMovimientoManual } from "@/services/stock.service";

export const GET = ruta<{ id: string }>(async ({ usuario, params, query }) =>
  listarMovimientosProducto(usuario, leerId(params.id, "El producto"), query),
);

export const POST = ruta<{ id: string }>(async ({ usuario, params, body }) => {
  const movimiento = await registrarMovimientoManual(usuario, leerId(params.id, "El producto"), body);
  return creado(movimiento);
});
