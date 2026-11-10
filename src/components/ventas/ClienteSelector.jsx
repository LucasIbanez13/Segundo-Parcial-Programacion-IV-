"use client";

import { Campo, claseControl, ENLACE } from "@/components/clientes/base";
import { CONSUMIDOR_FINAL } from "@/lib/constants";
import Panel from "./Panel";

// Selección de cliente (consumidor final o registrado) + '+ Nuevo cliente'.
// `clienteId` es null para consumidor final.
export default function ClienteSelector({ clientes, clienteId, onCambiar, onNuevoCliente, cargando }) {
  const seleccionado = clientes.find((cliente) => cliente.id === clienteId) ?? null;

  return (
    <Panel
      titulo="Cliente"
      subtitulo="Elegí a quién corresponde la venta."
      accion={
        <button type="button" onClick={onNuevoCliente} className={`${ENLACE} text-[15px]`}>
          + Nuevo cliente
        </button>
      }
    >
      <div className="grid grid-cols-2 gap-4 p-[22px] max-[550px]:grid-cols-1 max-[550px]:p-[17px]">
        <Campo etiqueta="Cliente">
          <select
            value={clienteId ?? ""}
            onChange={(evento) => onCambiar(evento.target.value === "" ? null : Number(evento.target.value))}
            disabled={cargando}
            className={claseControl()}
          >
            <option value="">{CONSUMIDOR_FINAL}</option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nombre}
              </option>
            ))}
          </select>
        </Campo>
        <Campo etiqueta="Documento">
          <input value={seleccionado?.documento ?? "—"} readOnly className={claseControl(null, { soloLectura: true })} />
        </Campo>
      </div>
    </Panel>
  );
}
