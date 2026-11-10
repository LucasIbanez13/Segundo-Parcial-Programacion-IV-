"use client";

import { Aviso, useConsultaApi } from "@/components/clientes/base";
import Panel from "./Panel";
import VentasStats from "./VentasStats";
import VentasTable from "./VentasTable";

function Mensaje({ children }) {
  return <p className="px-5 py-10 text-center text-[13px] text-muted">{children}</p>;
}

// Indicadores y tabla de comprobantes recientes.
export default function VentasHistorial() {
  const { datos, error, cargando, reintentar } = useConsultaApi("/api/ventas");
  const ventas = datos?.datos;

  return (
    <div className="grid grid-cols-1">
      {error && (
        <div className="mb-[18px]">
          <Aviso onReintentar={reintentar}>{`No pudimos cargar las ventas. ${error.message}`}</Aviso>
        </div>
      )}
      {ventas && <VentasStats ventas={ventas} />}
      <Panel titulo="Comprobantes recientes" className="overflow-x-auto">
        {!ventas && cargando && <Mensaje>Cargando ventas…</Mensaje>}
        {ventas?.length === 0 && <Mensaje>Todavía no hay ventas registradas.</Mensaje>}
        {ventas?.length > 0 && <VentasTable ventas={ventas} />}
      </Panel>
    </div>
  );
}
