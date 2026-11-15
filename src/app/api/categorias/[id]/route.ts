// PATCH /api/categorias/{id} — admin. RF-P7. nombre, activa.
// 200; 409 NOMBRE_DUPLICADO; 409 CATEGORIA_EN_USO si se desactiva con productos activos.
import { leerId } from "@/lib/http/parametros";
import { ruta } from "@/lib/http/ruta";
import { editarCategoria } from "@/services/categorias.service";

export const PATCH = ruta<{ id: string }>(async ({ usuario, params, body }) =>
  editarCategoria(usuario, leerId(params.id, "La categoría"), body),
);
