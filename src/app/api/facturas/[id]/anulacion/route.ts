// POST /api/facturas/{id}/anulacion — admin. RF-V9. 200 con la factura anulada; 409 FACTURA_ANULADA; 422 sin motivo.
import { leerId } from "@/lib/http/parametros";
import { ruta } from "@/lib/http/ruta";
import { anularFactura } from "@/services/facturas.service";

export const POST = ruta<{ id: string }>(async ({ usuario, params, body }) =>
  anularFactura(usuario, leerId(params.id, "La factura"), body),
);
