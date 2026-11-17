// Insignias del dominio de ventas: forma de pago y estado de la factura.
import { Insignia } from "@/components/comunes/InsigniaEstado";
import { ETIQUETAS_FORMA_PAGO, type EstadoFactura, type FormaPago } from "@/lib/constants";

export function InsigniaFormaPago({ forma }: { forma: FormaPago }) {
  return (
    <Insignia tono={forma === "cuenta_corriente" ? "advertencia" : forma === "contado" ? "principal" : "neutro"}>
      {ETIQUETAS_FORMA_PAGO[forma]}
    </Insignia>
  );
}

// Regla 5: la factura anulada queda visible con su estado.
export function InsigniaEstadoFactura({ estado }: { estado: EstadoFactura }) {
  return (
    <Insignia tono={estado === "anulada" ? "peligro" : "exito"}>
      <span aria-hidden className="mr-1 inline-block size-1.5 rounded-full bg-current" />
      {estado === "anulada" ? "Anulada" : "Emitida"}
    </Insignia>
  );
}
