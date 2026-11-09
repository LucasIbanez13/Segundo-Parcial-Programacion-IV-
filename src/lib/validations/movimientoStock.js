// Esquemas zod de movimientos de stock. Contrato: docs/02-api-rest.md (Movimientos de stock)
import { z } from "zod";
import { TIPOS_MOVIMIENTO } from "@/lib/constants";
import { enteroPositivo, idTexto, textoObligatorio } from "./comun.js";

// El origen, el usuario y la fecha los asigna el servidor: si vienen en el cuerpo, 422.
export const crearMovimientoSchema = z
  .object({
    productoId: enteroPositivo("El producto"),
    tipo: z.enum(Object.values(TIPOS_MOVIMIENTO), { message: "El tipo debe ser ENTRADA o SALIDA." }),
    cantidad: enteroPositivo("La cantidad"),
    motivo: textoObligatorio("El motivo"),
  })
  .strict();

// Query string de GET /api/movimientos-stock.
export const filtrosMovimientosSchema = z.object({
  productoId: idTexto.optional(),
});
