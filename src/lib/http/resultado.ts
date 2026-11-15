// Resultado de una Server Action o de una llamada a la API desde el navegador.
// Sin dependencias del servidor: lo usan los formularios.
import type { CuerpoError } from "@/lib/errors";

export type ResultadoAccion<T> = { ok: true; data: T } | { ok: false; error: CuerpoError };

const ERROR_DE_RED: CuerpoError = {
  code: "ERROR_INTERNO",
  message: "No pudimos conectarnos con el servidor. Revisá tu conexión y probá de nuevo.",
};

// fetch a la API que nunca lanza: devuelve el mismo formato que las Server Actions.
export async function llamarApi<T = unknown>(
  url: string,
  opciones: { method?: string; body?: unknown } = {},
): Promise<ResultadoAccion<T>> {
  try {
    const respuesta = await fetch(url, {
      method: opciones.method ?? "GET",
      headers: opciones.body === undefined ? undefined : { "Content-Type": "application/json" },
      body: opciones.body === undefined ? undefined : JSON.stringify(opciones.body),
    });
    if (respuesta.status === 204) return { ok: true, data: undefined as T };

    const cuerpo = await respuesta.json().catch(() => null);
    if (respuesta.ok) return { ok: true, data: cuerpo as T };
    return { ok: false, error: cuerpo?.error ?? ERROR_DE_RED };
  } catch {
    return { ok: false, error: ERROR_DE_RED };
  }
}
