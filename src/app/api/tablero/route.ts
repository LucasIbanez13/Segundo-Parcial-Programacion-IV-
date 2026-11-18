// GET /api/tablero — ambos roles. RF-T1 a RF-T3. Indicadores, gráficos y más vendidos en una sola respuesta.
import { ruta } from "@/lib/http/ruta";
import { obtenerTablero } from "@/services/tablero.service";

export const GET = ruta(async ({ usuario }) => obtenerTablero(usuario));
