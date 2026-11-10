"use client";

import { useEffect } from "react";
import { Aviso, useConsultaApi } from "@/components/clientes/base";
import Comprobante from "./Comprobante";

// Carga el comprobante y lo muestra en modo lectura.
export default function DetalleVenta({ id, avisoExito }) {
  const { datos: venta, error, cargando, reintentar } = useConsultaApi(`/api/ventas/${encodeURIComponent(id)}`);

  // Quita el aviso de la URL para que no reaparezca al recargar.
  useEffect(() => {
    if (avisoExito) window.history.replaceState(null, "", `/ventas/${id}`);
  }, [avisoExito, id]);

  if (error) {
    return error.status === 404 ? (
      <Aviso>Este comprobante no existe. Volvé al listado para elegir otro.</Aviso>
    ) : (
      <Aviso onReintentar={reintentar}>{`No pudimos cargar el comprobante. ${error.message}`}</Aviso>
    );
  }
  if (cargando || !venta) return <p className="py-10 text-center text-[13px] text-muted">Cargando comprobante…</p>;

  return (
    <div className="grid grid-cols-1 gap-[18px]">
      {avisoExito && <Aviso variante="exito">{avisoExito}</Aviso>}
      <Comprobante venta={venta} />
    </div>
  );
}
