// GET  /api/usuarios — admin. RF-U4. q, activo y paginación.
// POST /api/usuarios — admin. RF-U4. 201; 409 EMAIL_DUPLICADO.
import { creado, ruta } from "@/lib/http/ruta";
import { crearUsuario, listarUsuarios } from "@/services/usuarios.service";

export const GET = ruta(async ({ usuario, query }) => listarUsuarios(usuario, query));

export const POST = ruta(async ({ usuario, body }) => {
  const nuevo = await crearUsuario(usuario, body);
  return creado(nuevo, `/api/usuarios/${nuevo.id}`);
});
