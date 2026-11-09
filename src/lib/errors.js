// Errores de la aplicación y helper de respuesta { error: { codigo, mensaje, detalles } }.
// Códigos: ver docs/02-api-rest.md (Formato de errores)
import { NextResponse } from "next/server";

export const CODIGOS_ERROR = Object.freeze({
  JSON_INVALIDO: "JSON_INVALIDO",
  NO_AUTENTICADO: "NO_AUTENTICADO",
  CREDENCIALES_INVALIDAS: "CREDENCIALES_INVALIDAS",
  PROHIBIDO: "PROHIBIDO",
  NO_ENCONTRADO: "NO_ENCONTRADO",
  VALIDACION: "VALIDACION",
  CODIGO_DUPLICADO: "CODIGO_DUPLICADO",
  ACCESO_DUPLICADO: "ACCESO_DUPLICADO",
  STOCK_INSUFICIENTE: "STOCK_INSUFICIENTE",
  PRODUCTO_INACTIVO: "PRODUCTO_INACTIVO",
  PAGO_SUPERA_SALDO: "PAGO_SUPERA_SALDO",
  ULTIMO_ADMINISTRADOR: "ULTIMO_ADMINISTRADOR",
  ERROR_INTERNO: "ERROR_INTERNO",
});

// Error previsto por la aplicación: su mensaje se le puede mostrar al usuario.
export class ErrorApi extends Error {
  constructor(status, codigo, mensaje, detalles = null) {
    super(mensaje);
    this.name = "ErrorApi";
    this.status = status;
    this.codigo = codigo;
    this.detalles = detalles;
  }
}

// Convierte cualquier error en la respuesta de la API.
// Lo inesperado se registra en el servidor y responde 500 sin exponer detalles internos.
export function respuestaError(error) {
  if (error instanceof ErrorApi) {
    return NextResponse.json(
      { error: { codigo: error.codigo, mensaje: error.message, detalles: error.detalles } },
      { status: error.status },
    );
  }

  console.error("Error inesperado en la API:", error);
  return NextResponse.json(
    {
      error: {
        codigo: CODIGOS_ERROR.ERROR_INTERNO,
        mensaje: "Ocurrió un error inesperado. Probá de nuevo.",
        detalles: null,
      },
    },
    { status: 500 },
  );
}
