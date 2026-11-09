"use client";

import { useEffect, useRef, useState } from "react";
import { pedirApi } from "./clienteApi";

// Consulta una URL de la API y se repite cuando esta cambia.
// `retardo` aplica debounce a los cambios; la primera carga sale sin esperar.
// Cada consulta nueva cancela la anterior, así una respuesta vieja no pisa a la más reciente.
export function useConsultaApi(url, { retardo = 0 } = {}) {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [intento, setIntento] = useState(0);
  const yaConsulto = useRef(false);

  useEffect(() => {
    const controlador = new AbortController();
    setCargando(true);

    const temporizador = setTimeout(
      async () => {
        try {
          const respuesta = await pedirApi(url, { signal: controlador.signal });
          setDatos(respuesta);
          setError(null);
          setCargando(false);
        } catch (problema) {
          if (problema.name === "AbortError") return;
          setError(problema);
          setCargando(false);
        }
      },
      yaConsulto.current ? retardo : 0,
    );
    yaConsulto.current = true;

    return () => {
      clearTimeout(temporizador);
      controlador.abort();
    };
  }, [url, retardo, intento]);

  return { datos, setDatos, error, cargando, reintentar: () => setIntento((actual) => actual + 1) };
}
