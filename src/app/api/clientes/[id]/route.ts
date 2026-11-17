// GET   /api/clientes/{id} — ambos. RF-C3. El cliente y sus últimas facturas.
// PATCH /api/clientes/{id} — ambos. RF-C2, RF-C7. 200; 409 DOCUMENTO_DUPLICADO; 422 SALDO_PENDIENTE.
import { leerId } from "@/lib/http/parametros";
import { ruta } from "@/lib/http/ruta";
import { editarCliente, obtenerCliente } from "@/services/clientes.service";

export const GET = ruta<{ id: string }>(async ({ usuario, params }) =>
  obtenerCliente(usuario, leerId(params.id, "El cliente")),
);

export const PATCH = ruta<{ id: string }>(async ({ usuario, params, body }) =>
  editarCliente(usuario, leerId(params.id, "El cliente"), body),
);
