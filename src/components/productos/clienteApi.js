// Comunicación con la API y traducción de sus errores para los formularios.

export class ErrorDeApi extends Error {
  constructor(status, codigo, mensaje, detalles = null) {
    super(mensaje);
    this.status = status;
    this.codigo = codigo;
    this.detalles = detalles;
  }
}

// Devuelve el JSON de la respuesta o lanza ErrorDeApi.
export async function pedirApi(url, { metodo = "GET", cuerpo, signal } = {}) {
  let respuesta;
  try {
    respuesta = await fetch(url, {
      method: metodo,
      signal,
      headers: cuerpo === undefined ? undefined : { "Content-Type": "application/json" },
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new ErrorDeApi(0, "SIN_CONEXION", "No pudimos conectarnos con el servidor. Revisá tu conexión.");
  }

  if (respuesta.status === 401) {
    window.location.assign("/login");
    throw new ErrorDeApi(401, "NO_AUTENTICADO", "Tu sesión expiró. Volvé a ingresar.");
  }

  const datos = await respuesta.json().catch(() => null);
  if (respuesta.ok) return datos;

  throw new ErrorDeApi(
    respuesta.status,
    datos?.error?.codigo ?? "ERROR_INTERNO",
    datos?.error?.mensaje ?? "Ocurrió un error inesperado. Probá de nuevo.",
    datos?.error?.detalles ?? null,
  );
}

// Convierte los errores 422 del servidor en { campo: mensaje }.
export function erroresDeCampos(error) {
  const errores = {};
  for (const { campo, mensaje } of error.detalles?.errores ?? []) {
    if (campo && !errores[campo]) errores[campo] = mensaje;
  }
  return errores;
}

// Valida con el mismo esquema zod que usa el servidor, para avisar sin esperar la respuesta.
export function validarEnCliente(esquema, valores) {
  const resultado = esquema.safeParse(valores);
  if (resultado.success) return { datos: resultado.data, errores: {} };

  const errores = {};
  for (const problema of resultado.error.issues) {
    const campo = problema.path.join(".");
    if (!errores[campo]) errores[campo] = problema.message;
  }
  return { datos: null, errores };
}
