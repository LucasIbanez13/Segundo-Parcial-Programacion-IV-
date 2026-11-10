import { COLORES_FORMA_PAGO, ETIQUETAS_FORMA_PAGO } from "./formasPago";

export default function BadgeFormaPago({ formaPago }) {
  return (
    <span className={`inline-block rounded-[5px] px-2 py-[5px] text-[11px] font-bold ${COLORES_FORMA_PAGO[formaPago]}`}>
      {ETIQUETAS_FORMA_PAGO[formaPago] ?? formaPago}
    </span>
  );
}
