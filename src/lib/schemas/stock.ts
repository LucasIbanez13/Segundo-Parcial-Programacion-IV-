// Esquemas de movimientos de stock (sección 11.4, RF-P4 a RF-P6). Compartidos por los formularios y por stock.service.
import { z } from "zod";
import { MOTIVOS_EGRESO, MOTIVOS_INGRESO, TIPOS_MOVIMIENTO_STOCK } from "@/lib/constants";
import {
  fechaDia,
  finDelDiaArgentina,
  idTexto,
  inicioDelDiaArgentina,
  MENSAJE_CAMPOS_EXTRA,
  paginacion,
} from "./comun";

// Entero mayor que cero: el signo lo pone el servidor según el tipo (sección 11.4).
const cantidad = z
  .number({ required_error: "La cantidad es obligatoria.", invalid_type_error: "La cantidad debe ser un número." })
  .int("La cantidad debe ser un número entero.")
  .positive("La cantidad debe ser mayor que cero.")
  .max(1_000_000, "La cantidad es demasiado alta.");

const observacion = z
  .string({ invalid_type_error: "La observación debe ser un texto." })
  .trim()
  .max(300, "La observación no puede superar los 300 caracteres.")
  .nullish()
  .transform((texto) => (texto ? texto : null));

function motivo(opciones: readonly [string, ...string[]]) {
  return z.enum(opciones as [string, ...string[]], {
    errorMap: () => ({ message: `Seleccioná un motivo: ${opciones.join(", ")}.` }),
  });
}

// POST /api/productos/{id}/movimientos — RF-P4 (ingreso) y RF-P5 (egreso, con motivo obligatorio).
// El motivo depende del tipo: por eso es una unión discriminada por "tipo".
export const movimientoManualSchema = z.discriminatedUnion(
  "tipo",
  [
    z
      .object({ tipo: z.literal("ingreso"), cantidad, motivo: motivo(MOTIVOS_INGRESO), observacion })
      .strict(MENSAJE_CAMPOS_EXTRA),
    z
      .object({ tipo: z.literal("egreso"), cantidad, motivo: motivo(MOTIVOS_EGRESO), observacion })
      .strict(MENSAJE_CAMPOS_EXTRA),
  ],
  {
    errorMap: (problema, contexto) =>
      problema.code === "invalid_union_discriminator"
        ? { message: "Seleccioná el tipo: ingreso o egreso." }
        : { message: contexto.defaultError },
  },
);

// GET /api/productos/{id}/movimientos — RF-P6. Solo paginación.
export const filtrosMovimientosProductoSchema = paginacion;

// GET /api/movimientos-stock — RF-P6. productoId, tipo, desde, hasta (AAAA-MM-DD, hora de Argentina) y paginación.
export const filtrosMovimientosSchema = paginacion
  .extend({
    productoId: idTexto.optional(),
    tipo: z
      .enum(TIPOS_MOVIMIENTO_STOCK, {
        errorMap: () => ({ message: "El tipo debe ser venta, anulacion, ingreso o egreso." }),
      })
      .optional(),
    desde: fechaDia.optional(),
    hasta: fechaDia.optional(),
  })
  .refine((filtros) => !filtros.desde || !filtros.hasta || filtros.desde <= filtros.hasta, {
    message: "La fecha hasta no puede ser anterior a la fecha desde.",
    path: ["hasta"],
  })
  // desde/hasta pasan a instantes: [inicio de "desde", inicio del día siguiente a "hasta").
  .transform(({ desde, hasta, ...resto }) => ({
    ...resto,
    desde: desde ? inicioDelDiaArgentina(desde) : undefined,
    hasta: hasta ? finDelDiaArgentina(hasta) : undefined,
  }));

export type MovimientoManualEntrada = z.input<typeof movimientoManualSchema>;
export type FiltrosMovimientos = z.output<typeof filtrosMovimientosSchema>;
