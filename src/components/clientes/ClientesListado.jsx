"use client";

import { useEffect, useState } from "react";
import { Aviso, claseControl, PANEL, useConsultaApi } from "./base";
import ClientesTable from "./ClientesTable";

const RETARDO_BUSQUEDA_MS = 300;

function Mensaje({ children }) {
  return <p className="px-5 py-10 text-center text-[13px] text-muted">{children}</p>;
}

// Buscador y tabla de clientes. La búsqueda la hace el servidor (sin mayúsculas ni acentos).
export default function ClientesListado({ avisoExito }) {
  const [busqueda, setBusqueda] = useState("");
  const q = busqueda.trim();
  const url = q ? `/api/clientes?${new URLSearchParams({ q })}` : "/api/clientes";
  const { datos, error, cargando, reintentar } = useConsultaApi(url, { retardo: RETARDO_BUSQUEDA_MS });
  const clientes = datos?.datos;

  // Quita el aviso de la URL para que no reaparezca al recargar.
  useEffect(() => {
    if (avisoExito) window.history.replaceState(null, "", "/clientes");
  }, [avisoExito]);

  return (
    <div className="grid grid-cols-1 gap-[18px]">
      {avisoExito && <Aviso variante="exito">{avisoExito}</Aviso>}

      <label className="max-w-md text-xs font-bold text-[#52675b]">
        Buscar cliente
        <input
          type="search"
          value={busqueda}
          onChange={(evento) => setBusqueda(evento.target.value)}
          placeholder="Nombre o documento"
          className={claseControl()}
        />
      </label>

      {error && <Aviso onReintentar={reintentar}>{`No pudimos cargar los clientes. ${error.message}`}</Aviso>}

      <div
        aria-busy={cargando}
        className={`${PANEL} overflow-x-auto transition-opacity ${cargando && clientes ? "opacity-60" : ""}`}
      >
        {!clientes && cargando && <Mensaje>Cargando clientes…</Mensaje>}
        {clientes?.length === 0 && (
          <Mensaje>
            {q ? `No encontramos clientes para “${q}”.` : "Todavía no hay clientes. Agregá el primero."}
          </Mensaje>
        )}
        {clientes?.length > 0 && <ClientesTable clientes={clientes} />}
      </div>
    </div>
  );
}
