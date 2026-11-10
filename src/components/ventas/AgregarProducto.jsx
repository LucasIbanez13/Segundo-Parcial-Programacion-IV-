"use client";

import { useState } from "react";
import { BOTON_SECUNDARIO, Campo, claseControl, formatearMoneda } from "@/components/clientes/base";

// Selector de producto activo + botón 'Agregar'. Los productos sin stock aparecen deshabilitados.
export default function AgregarProducto({ productos, onAgregar, cargando }) {
  const [productoId, setProductoId] = useState("");
  const disponibles = productos.filter((producto) => producto.stockActual > 0);
  // Si el elegido se quedó sin stock (por ejemplo, al recargar), se usa el primero disponible.
  const elegido = disponibles.find((producto) => String(producto.id) === productoId) ?? disponibles[0];

  return (
    <div className="flex items-end gap-2.5 max-[550px]:flex-col max-[550px]:items-stretch">
      <div className="flex-1">
        <Campo etiqueta="Agregar producto">
          <select
            value={elegido ? String(elegido.id) : ""}
            onChange={(evento) => setProductoId(evento.target.value)}
            disabled={cargando || productos.length === 0}
            className={claseControl()}
          >
            {productos.length === 0 && <option value="">{cargando ? "Cargando productos…" : "No hay productos activos"}</option>}
            {productos.map((producto) => (
              <option key={producto.id} value={producto.id} disabled={producto.stockActual <= 0}>
                {`${producto.codigo} · ${producto.nombre} · ${formatearMoneda(producto.precioVentaCentavos)}`}
                {producto.stockActual <= 0 ? " (sin stock)" : ""}
              </option>
            ))}
          </select>
        </Campo>
      </div>
      <button
        type="button"
        onClick={() => elegido && onAgregar(elegido)}
        disabled={!elegido}
        className={BOTON_SECUNDARIO}
      >
        Agregar
      </button>
    </div>
  );
}
