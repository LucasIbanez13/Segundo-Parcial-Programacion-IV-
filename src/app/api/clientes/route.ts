// GET  /api/clientes — ambos. RF-C1, RF-C6. q, conDeuda, orden, activo y paginación.
// POST /api/clientes — ambos. RF-C2, RF-V2. 201; 409 DOCUMENTO_DUPLICADO.
import { creado, ruta } from "@/lib/http/ruta";
import { crearCliente, listarClientes } from "@/services/clientes.service";

export const GET = ruta(async ({ usuario, query }) => listarClientes(usuario, query));

export const POST = ruta(async ({ usuario, body }) => {
  const nuevo = await crearCliente(usuario, body);
  return creado(nuevo, `/api/clientes/${nuevo.id}`);
});
