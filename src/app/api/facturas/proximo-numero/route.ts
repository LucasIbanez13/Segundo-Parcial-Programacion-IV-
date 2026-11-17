// GET /api/facturas/proximo-numero — ambos. RF-V1. Solo informativo: el número real se asigna al confirmar.
import { ruta } from "@/lib/http/ruta";
import { proximoNumero } from "@/services/facturas.service";

export const GET = ruta(async ({ usuario }) => proximoNumero(usuario));
