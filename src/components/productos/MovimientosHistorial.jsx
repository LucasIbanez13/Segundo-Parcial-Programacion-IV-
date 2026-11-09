"use client";

import Aviso from "./base/Aviso";
import { PANEL } from "./base/estilos";
import MovimientosStockTable from "./MovimientosStockTable";
import { useConsultaApi } from "./useConsultaApi";

// Carga el historial y resuelve sus estados de carga, error y vacío.
export default function MovimientosHistorial() {
  const { datos, error, cargando, reintentar } = useConsultaApi("/api/movimientos-stock");

  if (error) {
    return <Aviso onReintentar={reintentar}>{`No pudimos cargar los movimientos. ${error.message}`}</Aviso>;
  }

  const movimientos = datos?.datos;

  return (
    <div aria-busy={cargando} className={`${PANEL} overflow-x-auto`}>
      {!movimientos && <p className="px-5 py-10 text-center text-[13px] text-muted">Cargando movimientos…</p>}
      {movimientos?.length === 0 && (
        <p className="px-5 py-10 text-center text-[13px] text-muted">Todavía no hay movimientos registrados.</p>
      )}
      {movimientos?.length > 0 && <MovimientosStockTable movimientos={movimientos} />}
    </div>
  );
}
