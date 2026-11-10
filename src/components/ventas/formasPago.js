// Textos y colores de las formas de pago, como en el mockup.
import { FORMAS_PAGO } from "@/lib/constants";

export const ETIQUETAS_FORMA_PAGO = Object.freeze({
  [FORMAS_PAGO.CONTADO]: "Contado",
  [FORMAS_PAGO.TARJETA]: "Tarjeta",
  [FORMAS_PAGO.CUENTA_CORRIENTE]: "Cuenta corriente",
});

// Cuenta corriente = amarillo, contado = verde, tarjeta = gris.
export const COLORES_FORMA_PAGO = Object.freeze({
  [FORMAS_PAGO.CONTADO]: "bg-badge-ok-bg text-badge-ok",
  [FORMAS_PAGO.TARJETA]: "bg-badge-neutral-bg text-badge-neutral",
  [FORMAS_PAGO.CUENTA_CORRIENTE]: "bg-badge-warn-bg text-badge-warn",
});
