// PATCH /api/usuarios/{id} — admin. RF-U4.
// 200; 409 EMAIL_DUPLICADO; 422 OPERACION_SOBRE_SI_MISMO.
import { leerId } from "@/lib/http/parametros";
import { ruta } from "@/lib/http/ruta";
import { editarUsuario } from "@/services/usuarios.service";

export const PATCH = ruta<{ id: string }>(async ({ usuario, params, body }) =>
  editarUsuario(usuario, leerId(params.id, "El usuario"), body),
);
