"use client";

// Confirmación después de crear o editar. Quita el aviso de la URL para que no reaparezca al recargar.
import { useEffect } from "react";
import { AVISO_EXITO } from "./estilos";

export default function AvisoExito({ mensaje }) {
  useEffect(() => {
    if (mensaje) window.history.replaceState(null, "", "/usuarios");
  }, [mensaje]);

  if (!mensaje) return null;
  return (
    <div role="status" className={AVISO_EXITO}>
      {mensaje}
    </div>
  );
}
