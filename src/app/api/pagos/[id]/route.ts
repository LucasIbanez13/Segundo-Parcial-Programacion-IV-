// GET /api/pagos/{id} — ambos. RF-C5. El recibo, para reimprimirlo.
import { leerId } from "@/lib/http/parametros";
import { ruta } from "@/lib/http/ruta";
import { obtenerRecibo } from "@/services/pagos.service";

export const GET = ruta<{ id: string }>(async ({ usuario, params }) => obtenerRecibo(usuario, leerId(params.id, "El pago")));
