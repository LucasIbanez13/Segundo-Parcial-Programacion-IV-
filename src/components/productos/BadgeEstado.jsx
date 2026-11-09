import { UMBRAL_STOCK_BAJO } from "@/lib/constants";

const BASE = "inline-block rounded-[5px] px-2 py-[5px] text-[11px] font-bold";

// Un producto inactivo se muestra como tal aunque tenga poco stock.
export default function BadgeEstado({ producto }) {
  if (!producto.activo) return <span className={`${BASE} bg-badge-neutral-bg text-badge-neutral`}>Inactivo</span>;
  if (producto.stockActual <= UMBRAL_STOCK_BAJO) {
    return <span className={`${BASE} bg-badge-warn-bg text-badge-warn`}>Stock bajo</span>;
  }
  return <span className={`${BASE} bg-badge-ok-bg text-badge-ok`}>Activo</span>;
}
