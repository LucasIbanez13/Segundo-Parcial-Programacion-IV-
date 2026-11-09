"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Aviso from "./base/Aviso";
import { BOTON_SECUNDARIO, claseControl, PANEL } from "./base/estilos";
import ProductosTable from "./ProductosTable";
import { useConsultaApi } from "./useConsultaApi";

const RETARDO_BUSQUEDA_MS = 300;

function Mensaje({ children }) {
  return <p className="px-5 py-10 text-center text-[13px] text-muted">{children}</p>;
}

// Buscador, accesos y tabla de productos.
export default function ProductosListado({ avisoExito }) {
  const [busqueda, setBusqueda] = useState("");
  const q = busqueda.trim();
  const url = q ? `/api/productos?${new URLSearchParams({ q })}` : "/api/productos";
  const { datos, error, cargando, reintentar } = useConsultaApi(url, { retardo: RETARDO_BUSQUEDA_MS });
  const productos = datos?.datos;

  // Quita el aviso de la URL para que no reaparezca al recargar.
  useEffect(() => {
    if (avisoExito) window.history.replaceState(null, "", "/productos");
  }, [avisoExito]);

  return (
    // grid-cols-1 limita el ancho de la columna: la tabla scrollea dentro de su panel en celular.
    <div className="grid grid-cols-1 gap-[18px]">
      {avisoExito && <Aviso variante="exito">{avisoExito}</Aviso>}

      <div className="flex flex-wrap items-end gap-2.5">
        <label className="min-w-60 flex-1 text-xs font-bold text-[#52675b] max-[550px]:min-w-full">
          Buscar producto
          <input
            type="search"
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
            placeholder="Nombre o código"
            className={claseControl()}
          />
        </label>
        <Link href="/productos/movimientos/nuevo" className={BOTON_SECUNDARIO}>
          Registrar movimiento
        </Link>
        <Link href="/productos/movimientos" className={BOTON_SECUNDARIO}>
          Ver movimientos
        </Link>
      </div>

      {error && (
        <Aviso onReintentar={reintentar}>{`No pudimos cargar los productos. ${error.message}`}</Aviso>
      )}

      <div
        aria-busy={cargando}
        className={`${PANEL} overflow-x-auto transition-opacity ${cargando && productos ? "opacity-60" : ""}`}
      >
        {!productos && cargando && <Mensaje>Cargando productos…</Mensaje>}
        {productos?.length === 0 && (
          <Mensaje>
            {q ? `No encontramos productos para “${q}”.` : "Todavía no hay productos. Agregá el primero."}
          </Mensaje>
        )}
        {productos?.length > 0 && <ProductosTable productos={productos} />}
      </div>
    </div>
  );
}
