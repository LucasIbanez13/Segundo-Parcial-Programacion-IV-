import Link from "next/link";
import { BOTON_PRIMARIO, formatearMoneda, PANEL } from "./base";

// Saldo adeudado del cliente y acceso a registrar un pago (deshabilitado si no debe nada).
export default function CuentaCorrienteResumen({ clienteId, saldoCentavos }) {
  return (
    <aside className={PANEL}>
      <h2 className="border-b border-[#edf0eb] px-[22px] py-5 text-[15px] font-bold">Saldo adeudado</h2>
      <div className="grid gap-4 p-[22px] max-[550px]:p-[17px]">
        <p className="font-serif text-[36px] leading-none text-heading">{formatearMoneda(saldoCentavos)}</p>
        <p className="text-xs text-muted">La suma de las ventas en cuenta corriente menos los pagos recibidos.</p>
        {saldoCentavos > 0 ? (
          <Link href={`/clientes/${clienteId}/pagos/nuevo`} className={`${BOTON_PRIMARIO} w-full`}>
            Registrar pago
          </Link>
        ) : (
          <button type="button" disabled className={`${BOTON_PRIMARIO} w-full`}>
            Registrar pago
          </button>
        )}
      </div>
    </aside>
  );
}
