// Esquemas de clientes, cuenta corriente y pagos (sección 11.5). Compartidos por los formularios
// y por clientes.service / pagos.service (sección 10.4).
// .strict(): un campo no previsto o de solo lectura (id, saldo, disponible...) responde 422.
import { z } from "zod";
import { MEDIOS_PAGO, TIPOS_DOC, type TipoDoc } from "@/lib/constants";
import { MENSAJE_CAMPOS_EXTRA, booleanoTexto, fechaDia, paginacion, textoBusqueda, textoObligatorio } from "./comun";

// ---------- Documento y búsqueda ----------

const DIGITOS_DOC: Record<TipoDoc, { minimo: number; maximo: number; ejemplo: string }> = {
  DNI: { minimo: 7, maximo: 8, ejemplo: "28.456.123" },
  CUIT: { minimo: 11, maximo: 11, ejemplo: "20-28456123-4" },
};

// Devuelve el documento como se guarda y se muestra ("28.456.123" / "20-28456123-4") y sus dígitos,
// o null si no tiene la cantidad de dígitos del tipo. Acepta puntos, guiones y espacios.
export function normalizarDocumento(tipoDoc: TipoDoc, nroDoc: string): { formateado: string; digitos: string } | null {
  if (!/^[\d.\-\s]+$/.test(nroDoc)) return null;
  const digitos = nroDoc.replace(/\D/g, "");
  const { minimo, maximo } = DIGITOS_DOC[tipoDoc];
  if (digitos.length < minimo || digitos.length > maximo) return null;

  const formateado =
    tipoDoc === "CUIT"
      ? `${digitos.slice(0, 2)}-${digitos.slice(2, 10)}-${digitos.slice(10)}`
      : Number(digitos).toLocaleString("es-AR").replace(/,/g, ".");
  return { formateado, digitos };
}

export function mensajeDocumentoInvalido(tipoDoc: TipoDoc): string {
  const { minimo, maximo, ejemplo } = DIGITOS_DOC[tipoDoc];
  const cantidad = minimo === maximo ? `${minimo}` : `${minimo} u ${maximo}`;
  return `El ${tipoDoc} debe tener ${cantidad} dígitos (ej. ${ejemplo}).`;
}

// Para buscar sin importar mayúsculas, acentos, espacios, puntos ni guiones (RF-C1, sección 11.5).
// La usa el servicio para guardar `nombreBusqueda` y para normalizar `q` de la misma forma.
export function normalizarParaBusqueda(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[\s.\-]/g, "");
}

// ---------- Cliente ----------

// Texto opcional: puede omitirse o ser null. Vacío después de trim() se guarda como null.
function textoOpcional(etiqueta: string, maximo: number) {
  return z
    .string({ invalid_type_error: `${etiqueta} debe ser un texto.` })
    .trim()
    .max(maximo, `${etiqueta} no puede superar los ${maximo} caracteres.`)
    .transform((texto) => (texto === "" ? null : texto))
    .nullable();
}

const tipoDoc = z.enum(TIPOS_DOC, { errorMap: () => ({ message: "Seleccioná DNI o CUIT." }) });
const nroDoc = z
  .string({ required_error: "El número de documento es obligatorio.", invalid_type_error: "El documento debe ser un texto." })
  .trim()
  .min(1, "El número de documento es obligatorio.")
  .max(20, "El documento es demasiado largo.");
const nombre = textoObligatorio("El nombre o razón social", 120);
const domicilio = textoOpcional("El domicilio", 200);
const telefono = textoOpcional("El teléfono", 40);
const emailOpcional = textoOpcional("El email", 200).refine(
  (valor) => valor === null || z.string().email().safeParse(valor).success,
  "Ingresá un email válido.",
);
const cuentaCorriente = z.boolean({ invalid_type_error: "Indicá si tiene cuenta corriente." });
// Centavos. null = sin límite.
const limiteCredito = z
  .number({ invalid_type_error: "El límite de crédito debe ser un número." })
  .int("El límite de crédito debe estar en centavos enteros.")
  .positive("El límite de crédito debe ser mayor que cero.")
  .max(Number.MAX_SAFE_INTEGER, "El límite de crédito es demasiado grande.")
  .nullable();
const activo = z.boolean({ invalid_type_error: "El estado debe ser verdadero o falso." });

// POST /api/clientes — RF-C2, RF-V2 (la misma ruta usa el alta rápida desde Nueva venta).
export const crearClienteSchema = z
  .object({
    tipoDoc,
    nroDoc,
    nombre,
    domicilio: domicilio.optional(),
    telefono: telefono.optional(),
    email: emailOpcional.optional(),
    cuentaCorriente: cuentaCorriente.optional(),
    limiteCredito: limiteCredito.optional(),
  })
  .strict(MENSAJE_CAMPOS_EXTRA)
  .superRefine((datos, contexto) => {
    if (!normalizarDocumento(datos.tipoDoc, datos.nroDoc)) {
      contexto.addIssue({ code: "custom", path: ["nroDoc"], message: mensajeDocumentoInvalido(datos.tipoDoc) });
    }
    if (datos.limiteCredito != null && !datos.cuentaCorriente) {
      contexto.addIssue({
        code: "custom",
        path: ["limiteCredito"],
        message: "El límite de crédito solo aplica a clientes con cuenta corriente.",
      });
    }
  });

// PATCH /api/clientes/{id} — RF-C2, RF-C7. Cualquier campo del alta, más `activo`.
// Las reglas que dependen del cliente actual (documento con su tipo, saldo pendiente) las aplica el servicio
// sobre el objeto resultante.
export const editarClienteSchema = z
  .object({
    tipoDoc: tipoDoc.optional(),
    nroDoc: nroDoc.optional(),
    nombre: nombre.optional(),
    domicilio: domicilio.optional(),
    telefono: telefono.optional(),
    email: emailOpcional.optional(),
    cuentaCorriente: cuentaCorriente.optional(),
    limiteCredito: limiteCredito.optional(),
    activo: activo.optional(),
  })
  .strict(MENSAJE_CAMPOS_EXTRA);

// GET /api/clientes — RF-C1 y RF-C6.
// `activo`: true (por defecto), false o todos. `orden`: por defecto saldo si conDeuda, si no nombre.
export const filtrosClientesSchema = paginacion
  .extend({
    q: textoBusqueda,
    conDeuda: booleanoTexto.optional(),
    orden: z.enum(["saldo", "nombre"], { errorMap: () => ({ message: "El orden debe ser saldo o nombre." }) }).optional(),
    activo: z
      .enum(["true", "false", "todos"], { errorMap: () => ({ message: "El filtro activo debe ser true, false o todos." }) })
      .optional()
      .transform((valor) => (valor === "todos" ? undefined : valor !== "false")),
  })
  .transform((filtros) => ({ ...filtros, orden: filtros.orden ?? (filtros.conDeuda ? "saldo" : "nombre") }));

// ---------- Cuenta corriente ----------

// GET /api/clientes/{id}/cuenta — RF-C4.
export const filtrosCuentaSchema = z
  .object({ desde: fechaDia.optional(), hasta: fechaDia.optional() })
  .refine((filtros) => !filtros.desde || !filtros.hasta || filtros.desde <= filtros.hasta, {
    path: ["hasta"],
    message: "La fecha hasta no puede ser anterior a desde.",
  });

// ---------- Pagos ----------

// POST /api/clientes/{id}/pagos — RF-C5. Que no supere la deuda lo verifica el servicio (regla 8).
export const registrarPagoSchema = z
  .object({
    importe: z
      .number({ required_error: "El importe es obligatorio.", invalid_type_error: "El importe debe ser un número." })
      .int("El importe debe estar en centavos enteros.")
      .positive("El importe debe ser mayor que cero.")
      .max(Number.MAX_SAFE_INTEGER, "El importe es demasiado grande."),
    medio: z.enum(MEDIOS_PAGO, {
      errorMap: () => ({ message: "Seleccioná un medio: efectivo, transferencia o tarjeta de débito." }),
    }),
    observacion: textoOpcional("La observación", 200).optional(),
  })
  .strict(MENSAJE_CAMPOS_EXTRA);

export type CrearClienteEntrada = z.input<typeof crearClienteSchema>;
export type EditarClienteEntrada = z.input<typeof editarClienteSchema>;
export type FiltrosClientes = z.output<typeof filtrosClientesSchema>;
export type RegistrarPagoEntrada = z.input<typeof registrarPagoSchema>;
