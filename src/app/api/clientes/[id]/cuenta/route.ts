// GET /api/clientes/{id}/cuenta — ambos. RF-C4. desde y hasta (AAAA-MM-DD, hora de Argentina).
import { leerId } from "@/lib/http/parametros";
import { ruta } from "@/lib/http/ruta";
import { obtenerCuentaCorriente } from "@/services/clientes.service";

export const GET = ruta<{ id: string }>(async ({ usuario, params, query }) =>
  obtenerCuentaCorriente(usuario, leerId(params.id, "El cliente"), query),
);
