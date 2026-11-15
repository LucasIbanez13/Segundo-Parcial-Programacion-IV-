// GET /api/auth/me — ambos roles. RF-U2. 200 con el usuario conectado; 401 sin sesión.
import { ruta } from "@/lib/http/ruta";

export const GET = ruta(async ({ usuario }) => usuario);
