// Esquemas zod de cliente. Contrato: docs/02-api-rest.md (Clientes)
// .strict() hace que un campo desconocido o de solo lectura (id, saldoCentavos...) responda 422.
import { z } from "zod";
import { textoBusqueda, textoObligatorio } from "./comun.js";

export const MENSAJE_SIN_CONTACTO ="Ingresá al menos un teléfono o un correo.";

// Texto opcional: puede omitirse o ser null. Si queda vacío después de trim() se guarda como null.
// También lo usa el esquema de pago (observación).
export function textoOpcional(etiqueta) {
  return z
    .string({ invalid_type_error: `${etiqueta} debe ser un texto.` })
    .trim()
    .refine((texto) => !texto.includes("\0"), `${etiqueta} contiene caracteres inválidos.`)
    .transform((texto) => (texto === "" ? null : texto))
    .nullable();
}

const nombre = textoObligatorio("El nombre");
const documento = textoObligatorio("El documento");
const telefono = textoOpcional("El teléfono");
const correo = textoOpcional("El correo").refine(
  (valor) => valor === null || z.string().email().safeParse(valor).success,
  "El correo no es válido.",
);

export const crearClienteSchema = z
  .object({
    nombre,
    documento,
    telefono: telefono.optional(),
    correo: correo.optional(),
  })
  .strict()
  .superRefine((datos, contexto) => {
    if (!datos.telefono && !datos.correo) {
      contexto.addIssue({ code: z.ZodIssueCode.custom, path: ["telefono"], message: MENSAJE_SIN_CONTACTO });
    }
  })
  .transform((datos) => ({ ...datos, telefono: datos.telefono ?? null, correo: datos.correo ?? null }));

// Edición parcial: lo omitido conserva su valor. Que quede al menos un contacto
// se valida en el service sobre el objeto resultante (lo enviado + lo que ya tenía).
export const actualizarClienteSchema = z
  .object({
    nombre: nombre.optional(),
    documento: documento.optional(),
    telefono: telefono.optional(),
    correo: correo.optional(),
  })
  .strict();

// Query string de GET /api/clientes.
export const filtrosClientesSchema = z.object({
  q: textoBusqueda,
});
