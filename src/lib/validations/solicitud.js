// Helpers de los route handlers para leer y validar lo que manda el cliente.
// Lanzan ErrorApi, que cada handler convierte en la respuesta { error: { ... } }.
import { ErrorApi } from "@/lib/errors";
import { idTexto } from "./comun.js";

// 400 si el cuerpo no es JSON válido.
export async function leerJson(request) {
  try {
    return await request.json();
  } catch {
    throw new ErrorApi(400, "JSON_INVALIDO", "El cuerpo de la solicitud no es un JSON válido.");
  }
}

// 422 con el detalle por campo si los datos no cumplen el esquema.
export function validar(esquema, datos) {
  const resultado = esquema.safeParse(datos);
  if (resultado.success) return resultado.data;

  throw new ErrorApi(422, "VALIDACION", resultado.error.issues[0].message, {
    errores: resultado.error.issues.map((problema) => ({
      campo: problema.path.join("."),
      mensaje: problema.message,
    })),
  });
}

// Un id de ruta que no es válido no puede corresponder a ningún recurso: 404.
export function leerIdDeRuta(id, mensaje) {
  const resultado = idTexto.safeParse(id);
  if (!resultado.success) throw new ErrorApi(404, "NO_ENCONTRADO", mensaje);
  return resultado.data;
}
