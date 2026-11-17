// Esquemas de facturas (sección 11.6, RF-V1 a RF-V9). Compartidos por la pantalla de Nueva venta
// y por facturas.service (sección 10.4).
// .strict(): un campo no previsto responde 422. Así se rechaza, por ejemplo, el número completo de una tarjeta
// (regla 9) o un precio enviado por el navegador (los precios los pone el servidor, sección 11.1).
import { z } from "zod";
import { ESTADOS_FACTURA, FORMAS_PAGO, TIPOS_TARJETA } from "@/lib/constants";
import { MENSAJE_CAMPOS_EXTRA, fechaDia, finDelDiaArgentina, idTexto, inicioDelDiaArgentina, paginacion, textoBusqueda, textoObligatorio } from "./comun";

// Tope razonable para que cantidades e importes nunca se acerquen al límite de los enteros seguros.
const CANTIDAD_MAXIMA = 1_000_000;
const IMPORTE_MAXIMO = 100_000_000_000; // $ 1.000.000.000,00

const id = (mensaje: string) =>
  z.number({ required_error: mensaje, invalid_type_error: mensaje }).int(mensaje).positive(mensaje);

// RF-V3: producto y cantidad entera mayor que cero. Sin precio: lo toma el servidor del catálogo.
const item = z
  .object({
    productoId: id("Seleccioná un producto."),
    cantidad: z
      .number({ required_error: "La cantidad es obligatoria.", invalid_type_error: "La cantidad debe ser un número." })
      .int("La cantidad debe ser un número entero.")
      .positive("La cantidad debe ser mayor que cero.")
      .max(CANTIDAD_MAXIMA, "La cantidad es demasiado alta."),
  })
  .strict(MENSAJE_CAMPOS_EXTRA);

// RF-V5: una forma de pago por factura, con sus datos propios.
const pagoContado = z
  .object({
    forma: z.literal("contado"),
    // Opcional: si falta, se toma el total (importe justo).
    montoRecibido: z
      .number({ invalid_type_error: "El monto recibido debe ser un número." })
      .int("El monto recibido debe estar en centavos enteros.")
      .positive("El monto recibido debe ser mayor que cero.")
      .max(IMPORTE_MAXIMO, "El monto recibido es demasiado alto.")
      .optional(),
  })
  .strict(MENSAJE_CAMPOS_EXTRA);

// Regla 9: de la tarjeta solo tipo, marca y últimos 4 dígitos.
const pagoTarjeta = z
  .object({
    forma: z.literal("tarjeta"),
    tarjeta: z
      .object(
        {
          tipo: z.enum(TIPOS_TARJETA, { errorMap: () => ({ message: "Elegí débito o crédito." }) }),
          marca: textoObligatorio("La marca", 40, true),
          ultimos4: z
            .string({ required_error: "Ingresá los últimos 4 dígitos.", invalid_type_error: "Ingresá los últimos 4 dígitos." })
            .regex(/^\d{4}$/, "Ingresá exactamente los últimos 4 dígitos."),
        },
        { required_error: "Faltan los datos de la tarjeta.", invalid_type_error: "Faltan los datos de la tarjeta." },
      )
      .strict(MENSAJE_CAMPOS_EXTRA),
  })
  .strict(MENSAJE_CAMPOS_EXTRA);

const pagoCuentaCorriente = z.object({ forma: z.literal("cuenta_corriente") }).strict(MENSAJE_CAMPOS_EXTRA);

// POST /api/facturas — RF-V1 a RF-V6.
export const emitirFacturaSchema = z
  .object({
    // null = consumidor final (RF-V2).
    clienteId: id("El cliente no es válido.").nullable(),
    items: z
      .array(item, { required_error: "Agregá al menos un producto.", invalid_type_error: "Agregá al menos un producto." })
      .min(1, "Agregá al menos un producto.")
      .max(200, "La factura tiene demasiados renglones.")
      .refine((items) => new Set(items.map((i) => i.productoId)).size === items.length, {
        message: "Un producto no puede repetirse: sumá la cantidad en su renglón.",
      }),
    pago: z.discriminatedUnion("forma", [pagoContado, pagoTarjeta, pagoCuentaCorriente], {
      errorMap: (problema, contexto) =>
        problema.code === "invalid_union_discriminator"
          ? { message: "Elegí contado, tarjeta o cuenta corriente." }
          : { message: contexto.defaultError },
    }),
  })
  .strict(MENSAJE_CAMPOS_EXTRA);

// POST /api/facturas/{id}/anulacion — RF-V9: motivo obligatorio.
export const anularFacturaSchema = z.object({ motivo: textoObligatorio("El motivo", 200) }).strict(MENSAJE_CAMPOS_EXTRA);

// GET /api/facturas — RF-V8: número o cliente, rango de fechas, cliente, vendedor, forma, estado y paginación.
export const filtrosFacturasSchema = paginacion
  .extend({
    q: textoBusqueda,
    desde: fechaDia.optional(),
    hasta: fechaDia.optional(),
    clienteId: idTexto.optional(),
    vendedorId: idTexto.optional(),
    forma: z.enum(FORMAS_PAGO, { errorMap: () => ({ message: "La forma debe ser contado, tarjeta o cuenta_corriente." }) }).optional(),
    estado: z.enum(ESTADOS_FACTURA, { errorMap: () => ({ message: "El estado debe ser emitida o anulada." }) }).optional(),
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

export type EmitirFacturaEntrada = z.input<typeof emitirFacturaSchema>;
export type FiltrosFacturas = z.output<typeof filtrosFacturasSchema>;
