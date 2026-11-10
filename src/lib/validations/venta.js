// Esquema zod de venta. Contrato: docs/02-api-rest.md (Ventas y comprobantes)
// Solo ids y cantidades: precios y totales los calcula el servidor desde la BD.
import { z } from "zod";
import { FORMAS_PAGO } from "@/lib/constants";
import { enteroPositivo } from "./comun.js";

export const MENSAJE_CUENTA_CORRIENTE_SIN_CLIENTE = "Seleccioná un cliente registrado para usar cuenta corriente.";

const itemVenta = z
  .object({
    productoId: enteroPositivo("El producto"),
    cantidad: enteroPositivo("La cantidad"),
  })
  .strict();

export const crearVentaSchema = z
  .object({
    // null = consumidor final.
    clienteId: enteroPositivo("El cliente").nullable(),
    formaPago: z.enum(Object.values(FORMAS_PAGO), {
      errorMap: () => ({ message: "Seleccioná una forma de pago válida." }),
    }),
    productos: z
      .array(itemVenta, {
        required_error: "Agregá al menos un producto para preparar la venta.",
        invalid_type_error: "Los productos deben ser una lista.",
      })
      .min(1, "Agregá al menos un producto para preparar la venta."),
  })
  .strict()
  .superRefine((venta, contexto) => {
    if (venta.formaPago === FORMAS_PAGO.CUENTA_CORRIENTE && venta.clienteId === null) {
      contexto.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["formaPago"],
        message: MENSAJE_CUENTA_CORRIENTE_SIN_CLIENTE,
      });
    }
  });
