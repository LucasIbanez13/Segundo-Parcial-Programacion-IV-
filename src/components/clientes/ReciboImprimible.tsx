// Recibo de pago numerado (RF-C5): comercio, número, fecha y hora, cliente, quién atendió, concepto, medio,
// observación, importe recibido y el saldo que le quedó al cliente.
import { Fila, Pila, Texto } from "@/components/base/primitivas";
import { Insignia } from "@/components/comunes/InsigniaEstado";
import { Marca } from "@/components/layout/Marca";
import { Separator } from "@/components/ui/separator";
import { ETIQUETAS_MEDIO_PAGO } from "@/lib/constants";
import { formatearFecha, formatearHora, formatearMoneda } from "@/lib/format";
import type { Recibo } from "@/services/pagos.service";

function Dato({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <Fila justificar="entre" alinear="inicio" espacio={4}>
      <Texto variante="suave">{etiqueta}</Texto>
      <Texto className="text-right">{children}</Texto>
    </Fila>
  );
}

export function ReciboImprimible({ recibo }: { recibo: Recibo }) {
  return (
    <Pila espacio={6} className="text-foreground">
      <Fila justificar="entre" alinear="inicio" espacio={4} envolver>
        <Marca />
        <Pila espacio={1} className="items-end">
          <Insignia tono="principal">RECIBO</Insignia>
          <Texto className="font-mono text-lg font-semibold">N° {recibo.numeroRecibo.replace(/^R /, "")}</Texto>
          <Texto variante="chico">
            {formatearFecha(recibo.fecha)} · {formatearHora(recibo.fecha)}
          </Texto>
        </Pila>
      </Fila>

      <Separator />

      <div className="grid gap-4 sm:grid-cols-2">
        <Pila espacio={0}>
          <Texto variante="chico">Recibimos de</Texto>
          <Texto variante="fuerte">{recibo.cliente.nombre}</Texto>
          <Texto variante="chico">
            {recibo.cliente.tipoDoc} {recibo.cliente.nroDoc}
          </Texto>
        </Pila>
        <Pila espacio={0}>
          <Texto variante="chico">Atendió</Texto>
          <Texto variante="fuerte">{recibo.usuario.nombre}</Texto>
        </Pila>
      </div>

      <Pila espacio={3} className="rounded-lg bg-muted/50 p-5">
        <Dato etiqueta="Concepto">Pago a cuenta corriente</Dato>
        <Dato etiqueta="Medio">{ETIQUETAS_MEDIO_PAGO[recibo.medio]}</Dato>
        {recibo.observacion && <Dato etiqueta="Observación">{recibo.observacion}</Dato>}
        <Separator />
        <Fila justificar="entre" alinear="centro" espacio={4}>
          <Texto variante="fuerte">Importe recibido</Texto>
          <Texto className="text-3xl font-semibold tracking-tight tabular-nums">{formatearMoneda(recibo.importe)}</Texto>
        </Fila>
      </Pila>

      <Texto className="text-right">
        <span className="text-muted-foreground">Saldo de la cuenta después de este pago: </span>
        <span className="font-semibold tabular-nums">{formatearMoneda(recibo.saldoCliente)}</span>
      </Texto>

      <Separator />
      <Texto variante="chico" className="text-center">
        Comprobante interno sin validez fiscal
      </Texto>
    </Pila>
  );
}
