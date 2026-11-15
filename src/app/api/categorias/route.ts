// GET  /api/categorias — ambos roles. RF-P7. Categorías activas, sin paginar (activa=false|todos: admin).
// POST /api/categorias — admin. RF-P7. 201; 409 NOMBRE_DUPLICADO.
import { creado, ruta } from "@/lib/http/ruta";
import { crearCategoria, listarCategorias } from "@/services/categorias.service";

export const GET = ruta(async ({ usuario, query }) => listarCategorias(usuario, query));

export const POST = ruta(async ({ usuario, body }) => {
  const nueva = await crearCategoria(usuario, body);
  return creado(nueva, `/api/categorias/${nueva.id}`);
});
