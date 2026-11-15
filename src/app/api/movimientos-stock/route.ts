// GET /api/movimientos-stock — ambos roles. RF-P6. productoId, tipo, desde, hasta (AAAA-MM-DD) y paginación.
import { ruta } from "@/lib/http/ruta";
import { listarMovimientos } from "@/services/stock.service";

export const GET = ruta(async ({ usuario, query }) => listarMovimientos(usuario, query));
