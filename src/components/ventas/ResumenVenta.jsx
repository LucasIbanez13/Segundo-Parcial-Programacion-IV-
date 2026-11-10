"use client";

import { Aviso, BOTON_PRIMARIO, formatearMoneda } from "@/components/clientes/base";
import FormaPagoSelector from "./FormaPagoSelector";
import Panel from "./Panel";

// Resumen: unidades, subtotal, total, forma de pago y botón 'Confirmar venta'.
export default function ResumenVenta({
  unidades,
  totalCentavos,
  formaPago,
  onCambiarFormaPago,
  permiteCuentaCorriente,
  error,
  puedeConfirmar,
  confirmando,
  onConfirmar,
}) {
  return (
    <Panel titulo="Resumen de venta" subtitulo="Comprobante interno">
      <div className="grid gap-5 p-[22px] max-[550px]:p-[17px]">
        <dl className="grid gap-3 border-b border-[#edf0eb] pb-4 text-[13px] text-muted">
          <div className="flex justify-between">
            <dt>Productos</dt>
            <dd>{`${unidades} ${unidades === 1 ? "unidad" : "unidades"}`}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd>{formatearMoneda(totalCentavos)}</dd>
          </div>
        </dl>
        <div className="flex items-baseline justify-between text-[19px] font-bold text-heading">
          <span>Total</span>
          <span>{formatearMoneda(totalCentavos)}</span>
        </div>

        <FormaPagoSelector
          valor={formaPago}
          onCambiar={onCambiarFormaPago}
          permiteCuentaCorriente={permiteCuentaCorriente}
        />

        {error && <Aviso>{error}</Aviso>}

        <button
          type="button"
          onClick={onConfirmar}
          disabled={!puedeConfirmar || confirmando}
          className={`${BOTON_PRIMARIO} w-full`}
        >
          {confirmando ? "Confirmando…" : "Confirmar venta →"}
        </button>
        <p className="-mt-2 text-xs text-muted">Al confirmar se verifican y descuentan las existencias.</p>
      </div>
    </Panel>
  );
}
