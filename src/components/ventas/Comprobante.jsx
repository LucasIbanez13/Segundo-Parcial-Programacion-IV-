import { formatearComprobante, formatearFecha, formatearMoneda, PANEL, TABLA, TD, TH } from "@/components/clientes/base";
import { ETIQUETAS_FORMA_PAGO } from "./formasPago";

const FORMATO_HORA = new Intl.DateTimeFormat("es-AR", { hour: "2-digit", minute: "2-digit" });

// Vista del comprobante. Todo sale de las copias históricas guardadas en la venta,
// así que no cambia aunque después se modifiquen productos o clientes.
export default function Comprobante({ venta }) {
  const datos = [
    { etiqueta: "Fecha", valor: `${formatearFecha(venta.fecha)}, ${FORMATO_HORA.format(new Date(venta.fecha))} h` },
    { etiqueta: "Forma de pago", valor: ETIQUETAS_FORMA_PAGO[venta.formaPago] ?? venta.formaPago },
    { etiqueta: "Cliente", valor: venta.clienteNombre },
    { etiqueta: "Documento", valor: venta.clienteDocumento ?? "—" },
  ];

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(220px,320px)] items-start gap-[22px] max-[850px]:grid-cols-1">
      <section className={PANEL}>
        <div className="flex items-start justify-between gap-3 border-b border-[#edf0eb] px-[22px] py-5 max-[550px]:p-[17px]">
          <div>
            <h2 className="text-[15px] font-bold">{`Comprobante interno ${formatearComprobante(venta.numero)}`}</h2>
            <p className="mt-1 text-xs text-[#829087]">No válido como comprobante fiscal</p>
          </div>
          <span className="rounded-[5px] bg-badge-ok-bg px-2 py-[5px] text-[11px] font-bold text-badge-ok">Registrada</span>
        </div>

        <dl className="grid grid-cols-2 gap-4 px-[22px] py-5 text-[13px] max-[550px]:grid-cols-1 max-[550px]:p-[17px]">
          {datos.map(({ etiqueta, valor }) => (
            <div key={etiqueta}>
              <dt className="text-xs text-muted">{etiqueta}</dt>
              <dd className="mt-1 font-bold">{valor}</dd>
            </div>
          ))}
        </dl>

        <div className="overflow-x-auto">
          <table className={TABLA}>
            <thead>
              <tr>
                <th className={TH}>Producto</th>
                <th className={`${TH} text-right`}>Cantidad</th>
                <th className={`${TH} text-right`}>Precio unitario</th>
                <th className={`${TH} text-right`}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {venta.productos.map((detalle) => (
                <tr key={detalle.productoId}>
                  <td className={TD}>{detalle.descripcion}</td>
                  <td className={`${TD} text-right`}>{detalle.cantidad}</td>
                  <td className={`${TD} text-right`}>{formatearMoneda(detalle.precioUnitarioCentavos)}</td>
                  <td className={`${TD} text-right`}>{formatearMoneda(detalle.subtotalCentavos)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <dl className="grid gap-3 px-[22px] py-5 text-[13px] max-[550px]:p-[17px]">
          <div className="flex justify-between text-muted">
            <dt>Subtotal</dt>
            <dd>{formatearMoneda(venta.totalCentavos)}</dd>
          </div>
          <div className="flex justify-between text-[19px] font-bold text-heading">
            <dt>Total</dt>
            <dd>{formatearMoneda(venta.totalCentavos)}</dd>
          </div>
        </dl>
      </section>

      <aside className="rounded-[9px] bg-help px-[22px] py-5 text-[13px] leading-[1.6] text-[#506958]">
        <h2 className="mb-2 text-sm font-bold text-[#294535]">Datos conservados</h2>
        <p>
          El comprobante conserva los datos registrados en la operación: cliente, productos y precios del momento de la
          venta, aunque después cambien.
        </p>
      </aside>
    </div>
  );
}
