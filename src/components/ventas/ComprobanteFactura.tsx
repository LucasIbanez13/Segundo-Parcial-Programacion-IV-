// Comprobante imprimible de una factura (RF-V7): comercio, número, fecha y hora, vendedor, comprador, detalle,
// total y forma de pago. Los renglones salen de la factura (descripción y precio congelados, regla 3).
// Si está anulada se ve el sello, el total tachado y quién la anuló, cuándo y por qué (regla 5).
import { Fila, Pila, Texto } from "@/components/base/primitivas";
import { Insignia } from "@/components/comunes/InsigniaEstado";
import { Marca } from "@/components/layout/Marca";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DATOS_COMERCIO, ETIQUETAS_FORMA_PAGO, ETIQUETAS_TIPO_TARJETA } from "@/lib/constants";
import { formatearFecha, formatearHora, formatearMoneda } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { FacturaPublica } from "@/services/facturas.service";

function DetallePago({ factura }: { factura: FacturaPublica }) {
  const { pago } = factura;
  if (pago.forma === "contado") {
    return (
      <Texto variante="chico">
        Recibido {formatearMoneda(pago.montoRecibido)} · Vuelto {formatearMoneda(pago.vuelto)}
      </Texto>
    );
  }
  if (pago.forma === "tarjeta") {
    return (
      <Texto variante="chico">
        {ETIQUETAS_TIPO_TARJETA[pago.tarjeta.tipo]} · {pago.tarjeta.marca} terminada en {pago.tarjeta.ultimos4}
      </Texto>
    );
  }
  return factura.saldoCliente === undefined ? null : (
    <Texto variante="chico">Saldo actual de la cuenta: {formatearMoneda(factura.saldoCliente)}</Texto>
  );
}

export function ComprobanteFactura({ factura }: { factura: FacturaPublica }) {
  const anulada = factura.estado === "anulada";

  return (
    <Pila espacio={6} className="relative text-foreground">
      <Fila justificar="entre" alinear="inicio" espacio={4} envolver>
        <Pila espacio={2}>
          <Marca />
          <Pila espacio={0}>
            <Texto variante="chico">{DATOS_COMERCIO.direccion}</Texto>
            <Texto variante="chico">Tel. {DATOS_COMERCIO.telefono}</Texto>
          </Pila>
        </Pila>
        <Pila espacio={1} className="items-end">
          <Insignia tono="principal">FACTURA</Insignia>
          <Texto className="font-mono text-lg font-semibold">N° {factura.numeroFormateado}</Texto>
          <Texto variante="chico">
            {formatearFecha(factura.fecha)} · {formatearHora(factura.fecha)}
          </Texto>
        </Pila>
      </Fila>

      <Separator />

      <div className="grid gap-4 sm:grid-cols-2">
        <Pila espacio={0}>
          <Texto variante="chico">Cliente</Texto>
          {factura.cliente ? (
            <>
              <Texto variante="fuerte">{factura.cliente.nombre}</Texto>
              <Texto variante="chico">
                {factura.cliente.tipoDoc} {factura.cliente.nroDoc}
                {factura.cliente.domicilio ? ` · ${factura.cliente.domicilio}` : ""}
              </Texto>
            </>
          ) : (
            <Texto variante="fuerte">Consumidor final</Texto>
          )}
        </Pila>
        <Pila espacio={0}>
          <Texto variante="chico">Vendedor</Texto>
          <Texto variante="fuerte">{factura.vendedor.nombre}</Texto>
        </Pila>
      </div>

      <div className="relative overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="hidden sm:table-cell">Código</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="text-right">Cant.</TableHead>
              <TableHead className="hidden text-right sm:table-cell">P. unit.</TableHead>
              <TableHead className="text-right">Subtotal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {factura.items.map((item) => (
              <TableRow key={item.productoId}>
                <TableCell className="hidden font-mono sm:table-cell">{item.codigo}</TableCell>
                <TableCell className="whitespace-normal">{item.descripcion}</TableCell>
                <TableCell className="text-right tabular-nums">{item.cantidad}</TableCell>
                <TableCell className="hidden text-right tabular-nums sm:table-cell">{formatearMoneda(item.precioUnitario)}</TableCell>
                <TableCell className="text-right tabular-nums">{formatearMoneda(item.subtotal)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {anulada && (
          <span
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 rounded-md border-4 border-destructive/50 px-4 py-1 text-3xl font-bold tracking-[0.3em] text-destructive/50"
          >
            ANULADA
          </span>
        )}
      </div>

      <Fila justificar="entre" alinear="fin" espacio={4} envolver>
        <Pila espacio={0}>
          <Texto variante="chico">Forma de pago</Texto>
          <Texto variante="fuerte">{ETIQUETAS_FORMA_PAGO[factura.pago.forma]}</Texto>
          <DetallePago factura={factura} />
        </Pila>
        <Pila espacio={0} className="items-end">
          <Texto variante="chico">Total</Texto>
          <Texto
            className={cn(
              "text-3xl font-semibold tracking-tight tabular-nums",
              anulada && "text-muted-foreground line-through",
            )}
          >
            {formatearMoneda(factura.total)}
          </Texto>
        </Pila>
      </Fila>

      {factura.anulacion && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <p className="font-medium">
            Anulada el {formatearFecha(factura.anulacion.fecha)} a las {formatearHora(factura.anulacion.fecha)} por{" "}
            {factura.anulacion.usuario.nombre}
          </p>
          <p>Motivo: {factura.anulacion.motivo}</p>
        </div>
      )}

      <Separator />
      <Texto variante="chico" className="text-center">
        Comprobante interno sin validez fiscal · Precios finales con impuestos incluidos
      </Texto>
    </Pila>
  );
}
