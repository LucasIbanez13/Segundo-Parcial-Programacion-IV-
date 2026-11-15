"use client";

// Hook común de formularios (sección 10.6): errores por campo (primero los de Zod, después los del
// servidor), estado de envío y aviso del resultado. El servidor vuelve a validar con el mismo esquema.
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import type { z } from "zod";
import type { CuerpoError, DetalleCampo } from "@/lib/errors";
import type { ResultadoAccion } from "@/lib/http/resultado";

type Errores = Record<string, string | undefined>;

function erroresPorCampo(detalles: DetalleCampo[]): Errores {
  const errores: Errores = {};
  for (const { campo, mensaje } of detalles) if (campo && !errores[campo]) errores[campo] = mensaje;
  return errores;
}

function detallesDeError(error: CuerpoError): DetalleCampo[] {
  return Array.isArray(error.details)
    ? (error.details as DetalleCampo[]).filter((d) => typeof d?.campo === "string")
    : [];
}

export function useFormulario<V extends Record<string, unknown>, R>({
  valoresIniciales,
  esquema,
  preparar = (valores) => valores,
  validacionExtra,
  enviar,
  mensajeExito,
  alExito,
}: {
  valoresIniciales: V;
  esquema?: z.ZodTypeAny;
  // Convierte los valores del formulario en el cuerpo que se envía (por ejemplo, pesos a centavos).
  preparar?: (valores: V) => unknown;
  // Reglas que solo existen en la interfaz, como "confirmar contraseña".
  validacionExtra?: (valores: V) => Errores;
  enviar: (datos: unknown) => Promise<ResultadoAccion<R>>;
  mensajeExito?: string | ((data: R) => string);
  alExito?: (data: R) => void;
}) {
  const [valores, setValores] = useState<V>(valoresIniciales);
  const [errores, setErrores] = useState<Errores>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  function cambiar<K extends keyof V>(campo: K, valor: V[K]) {
    setValores((actuales) => ({ ...actuales, [campo]: valor }));
    setErrores((actuales) => ({ ...actuales, [campo as string]: undefined }));
  }

  async function onSubmit(evento?: FormEvent) {
    evento?.preventDefault();
    if (enviando) return;
    setErrorGeneral(null);

    const datos = preparar(valores);
    // Si un campo tiene error de Zod y de la regla extra, se muestra el de Zod.
    const locales: Errores = { ...(validacionExtra?.(valores) ?? {}) };
    const resultadoZod = esquema?.safeParse(datos);
    if (resultadoZod && !resultadoZod.success) {
      Object.assign(
        locales,
        erroresPorCampo(resultadoZod.error.issues.map((p) => ({ campo: p.path.join("."), mensaje: p.message }))),
      );
    }
    if (Object.values(locales).some(Boolean)) {
      setErrores(locales);
      return;
    }

    setErrores({});
    setEnviando(true);
    const resultado = await enviar(datos);
    setEnviando(false);

    if (resultado.ok) {
      const texto = typeof mensajeExito === "function" ? mensajeExito(resultado.data) : mensajeExito;
      if (texto) toast.success(texto);
      alExito?.(resultado.data);
      return;
    }

    const delServidor = erroresPorCampo(detallesDeError(resultado.error));
    if (Object.keys(delServidor).length > 0) {
      setErrores(delServidor);
    } else {
      setErrorGeneral(resultado.error.message);
      toast.error(resultado.error.message);
    }
    if (resultado.error.code === "NO_AUTENTICADO") window.location.assign("/login");
  }

  return { valores, setValores, cambiar, errores, errorGeneral, enviando, onSubmit };
}
