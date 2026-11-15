// Única clase de error de la aplicación (sección 10.4) y códigos de la sección 11.8.
// Sin dependencias del servidor: la interfaz también usa los códigos para mostrar mensajes precisos.

export const CODIGOS_ERROR = {
  JSON_INVALIDO: "JSON_INVALIDO",
  NO_AUTENTICADO: "NO_AUTENTICADO",
  CREDENCIALES_INVALIDAS: "CREDENCIALES_INVALIDAS",
  SIN_PERMISO: "SIN_PERMISO",
  NO_ENCONTRADO: "NO_ENCONTRADO",
  CODIGO_DUPLICADO: "CODIGO_DUPLICADO",
  DOCUMENTO_DUPLICADO: "DOCUMENTO_DUPLICADO",
  EMAIL_DUPLICADO: "EMAIL_DUPLICADO",
  NOMBRE_DUPLICADO: "NOMBRE_DUPLICADO",
  CATEGORIA_EN_USO: "CATEGORIA_EN_USO",
  STOCK_INSUFICIENTE: "STOCK_INSUFICIENTE",
  FACTURA_ANULADA: "FACTURA_ANULADA",
  VALIDACION: "VALIDACION",
  PRODUCTO_INACTIVO: "PRODUCTO_INACTIVO",
  CUENTA_CORRIENTE_NO_HABILITADA: "CUENTA_CORRIENTE_NO_HABILITADA",
  LIMITE_CREDITO_EXCEDIDO: "LIMITE_CREDITO_EXCEDIDO",
  MONTO_INSUFICIENTE: "MONTO_INSUFICIENTE",
  PAGO_SUPERA_DEUDA: "PAGO_SUPERA_DEUDA",
  SALDO_PENDIENTE: "SALDO_PENDIENTE",
  CONTRASENA_ACTUAL_INCORRECTA: "CONTRASENA_ACTUAL_INCORRECTA",
  OPERACION_SOBRE_SI_MISMO: "OPERACION_SOBRE_SI_MISMO",
  ERROR_INTERNO: "ERROR_INTERNO",
} as const;

export type CodigoError = keyof typeof CODIGOS_ERROR;

// Detalle por campo de un error de validación: { campo, mensaje }.
export type DetalleCampo = { campo: string; mensaje: string };

// Forma pública de un error: { error: { code, message, details } } (sección 11.1).
export type CuerpoError = { code: CodigoError; message: string; details?: unknown };

export class ApiError extends Error {
  readonly status: number;
  readonly code: CodigoError;
  readonly details?: unknown;

  constructor(status: number, code: CodigoError, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }

  toJSON(): CuerpoError {
    return this.details === undefined
      ? { code: this.code, message: this.message }
      : { code: this.code, message: this.message, details: this.details };
  }
}

const MENSAJE_INTERNO = "Ocurrió un error inesperado. Probá de nuevo en unos minutos.";

// Convierte cualquier error en { status, cuerpo }. Lo inesperado se registra en el servidor
// y llega al cliente como 500 ERROR_INTERNO, sin su detalle (sección 10.4).
export function normalizarError(error: unknown): { status: number; cuerpo: CuerpoError } {
  if (error instanceof ApiError) return { status: error.status, cuerpo: error.toJSON() };

  console.error("Error inesperado:", error);
  return { status: 500, cuerpo: { code: CODIGOS_ERROR.ERROR_INTERNO, message: MENSAJE_INTERNO } };
}

// Errores frecuentes, con sus mensajes en un solo lugar.
export const errores = {
  noAutenticado: () => new ApiError(401, "NO_AUTENTICADO", "Tu sesión no es válida o venció. Volvé a ingresar."),
  sinPermiso: () => new ApiError(403, "SIN_PERMISO", "No tenés permiso para realizar esta operación."),
  noEncontrado: (recurso: string) => new ApiError(404, "NO_ENCONTRADO", `${recurso} no existe.`),
};
