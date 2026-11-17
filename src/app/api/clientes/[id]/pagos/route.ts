// POST /api/clientes/{id}/pagos — ambos. RF-C5.
// 201 con el recibo y el saldo nuevo; 422 PAGO_SUPERA_DEUDA; 422 CUENTA_CORRIENTE_NO_HABILITADA.
import { leerId } from "@/lib/http/parametros";
import { creado, ruta } from "@/lib/http/ruta";
import { registrarPago } from "@/services/pagos.service";

export const POST = ruta<{ id: string }>(async ({ usuario, params, body }) => {
  const recibo = await registrarPago(usuario, leerId(params.id, "El cliente"), body);
  return creado(recibo, `/api/pagos/${recibo.id}`);
});
