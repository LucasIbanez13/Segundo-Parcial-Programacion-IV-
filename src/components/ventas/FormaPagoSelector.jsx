"use client";

import { FORMAS_PAGO } from "@/lib/constants";
import { MENSAJE_CUENTA_CORRIENTE_SIN_CLIENTE } from "@/lib/validations/venta";
import { ETIQUETAS_FORMA_PAGO } from "./formasPago";

// Forma de pago: contado, tarjeta o cuenta corriente (solo con cliente registrado).
export default function FormaPagoSelector({ valor, onCambiar, permiteCuentaCorriente }) {
  return (
    <fieldset>
      <legend className="mb-3 text-[17px] font-bold text-heading">Forma de pago</legend>
      <div className="grid gap-2.5">
        {Object.values(FORMAS_PAGO).map((formaPago) => {
          const deshabilitada = formaPago === FORMAS_PAGO.CUENTA_CORRIENTE && !permiteCuentaCorriente;
          return (
            <label
              key={formaPago}
              className={`flex items-center gap-3 rounded-[7px] border border-border px-3.5 py-3 text-[13px] font-bold has-checked:border-primary has-focus-visible:outline-2 has-focus-visible:outline-focus ${
                deshabilitada ? "cursor-not-allowed text-muted opacity-60" : "cursor-pointer"
              }`}
            >
              <input
                type="radio"
                name="formaPago"
                value={formaPago}
                checked={valor === formaPago}
                disabled={deshabilitada}
                onChange={() => onCambiar(formaPago)}
                className="accent-primary"
              />
              {ETIQUETAS_FORMA_PAGO[formaPago]}
            </label>
          );
        })}
      </div>
      {!permiteCuentaCorriente && <p className="mt-3 text-xs text-muted">{MENSAJE_CUENTA_CORRIENTE_SIN_CLIENTE}</p>}
    </fieldset>
  );
}
