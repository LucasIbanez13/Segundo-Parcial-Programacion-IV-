// Esquema zod de pago. Contrato: docs/02-api-rest.md (Cuenta corriente y pagos)
// Que la fecha no sea futura y que el importe no supere el saldo lo valida el service.
import { z } from "zod";
import { textoOpcional } from "./cliente.js";
import { enteroPositivo } from "./comun.js";

export const registrarPagoSchema = z
  .object({
    // ISO 8601 con zona (ej. 2026-10-29T15:00:00Z o -03:00). La interfaz convierte la fecha local.
    fecha: z
      .string({ required_error: "La fecha es obligatoria.", invalid_type_error: "La fecha debe ser un texto." })
      .datetime({ offset: true, message: "La fecha no es válida." })
      .transform((texto) => new Date(texto)),
    importeCentavos: enteroPositivo("El importe"),
    observacion: textoOpcional("La observación").optional(),
  })
  .strict()
  .transform((datos) => ({ ...datos, observacion: datos.observacion ?? null }));
