"use client";

import { claseControl, ENLACE, formatearMoneda, TABLA, TD, TH } from "@/components/clientes/base";

// Tabla de productos de la venta: cantidad, precio, subtotal, quitar.
// Precio y subtotal son solo visuales: el servidor los recalcula al confirmar.
export default function ItemsVentaTable({ items, errores, onCambiarCantidad, onQuitar }) {
  return (
    <table className={TABLA}>
      <thead>
        <tr>
          <th className={TH}>Producto</th>
          <th className={TH}>Cantidad</th>
          <th className={`${TH} text-right`}>Precio</th>
          <th className={`${TH} text-right`}>Subtotal</th>
          <th className={TH}>Acción</th>
        </tr>
      </thead>
      <tbody>
        {items.map(({ producto, cantidad, subtotalCentavos }) => {
          const error = errores[producto.id];
          return (
            <tr key={producto.id} className="align-top">
              <td className={TD}>
                <span className="block font-bold">{producto.nombre}</span>
                <span className="text-xs text-muted">{`${producto.codigo} · Stock: ${producto.stockActual}`}</span>
              </td>
              <td className={TD}>
                <input
                  type="number"
                  min="1"
                  max={producto.stockActual}
                  step="1"
                  value={cantidad}
                  onChange={(evento) => onCambiarCantidad(producto.id, evento.target.value)}
                  aria-label={`Cantidad de ${producto.nombre}`}
                  aria-invalid={Boolean(error)}
                  className={`${claseControl(error)} mt-0 w-[76px]`}
                />
                {error && (
                  <span role="alert" className="mt-1 block max-w-48 text-xs whitespace-normal text-danger">
                    {error}
                  </span>
                )}
              </td>
              <td className={`${TD} text-right`}>{formatearMoneda(producto.precioVentaCentavos)}</td>
              <td className={`${TD} text-right`}>{subtotalCentavos === null ? "—" : formatearMoneda(subtotalCentavos)}</td>
              <td className={TD}>
                <button type="button" onClick={() => onQuitar(producto.id)} className={ENLACE}>
                  Quitar
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
