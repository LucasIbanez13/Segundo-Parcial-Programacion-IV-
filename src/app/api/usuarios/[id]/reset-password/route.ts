// POST /api/usuarios/{id}/reset-password — admin. RF-U5.
// 200 con { passwordTemporal }, que se muestra una sola vez.
import { leerId } from "@/lib/http/parametros";
import { ruta } from "@/lib/http/ruta";
import { restablecerPassword } from "@/services/usuarios.service";

export const POST = ruta<{ id: string }>(async ({ usuario, params }) =>
  restablecerPassword(usuario, leerId(params.id, "El usuario")),
);
