// GET /api/facturas/{id} — ambos. RF-V7. La factura completa; si está anulada, suma `anulacion`.
import { leerId } from "@/lib/http/parametros";
import { ruta } from "@/lib/http/ruta";
import { obtenerFactura } from "@/services/facturas.service";

export const GET = ruta<{ id: string }>(async ({ usuario, params }) => obtenerFactura(usuario, leerId(params.id, "La factura")));
