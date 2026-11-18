// Los cuatro indicadores del tablero (RF-T1): ventas de hoy, ventas del mes con ticket promedio,
// deuda en cuentas corrientes y productos bajo el stock mínimo. Los dos últimos llevan a su listado.
import { AlertTriangle, CalendarDays, TrendingUp, Wallet, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { formatearMoneda } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Tablero } from "@/services/tablero.service";

const NOMBRE_MES = new Intl.DateTimeFormat("es-AR", { month: "long", timeZone: "America/Argentina/Buenos_Aires" });

function plural(cantidad: number, singular: string, pluralTexto: string): string {
  return `${cantidad} ${cantidad === 1 ? singular : pluralTexto}`;
}

function Indicador({
  titulo,
  valor,
  detalle,
  icono: Icono,
  href,
  alerta = false,
}: {
  titulo: string;
  valor: string;
  detalle: string;
  icono: LucideIcon;
  href?: string;
  alerta?: boolean;
}) {
  const contenido = (
    <Card className={cn("h-full transition-colors", href && "hover:border-primary/40", alerta && "border-advertencia/40 bg-advertencia-suave/60")}>
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
          <span>{titulo}</span>
          <Icono className={cn("size-4", alerta && "text-advertencia")} aria-hidden />
        </div>
        <span className="text-2xl font-semibold tracking-tight tabular-nums">{valor}</span>
        <span className="text-xs text-muted-foreground">{detalle}</span>
      </CardContent>
    </Card>
  );
  return href ? (
    <Link href={href} className="rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
      {contenido}
    </Link>
  ) : (
    contenido
  );
}

export function TarjetasIndicadores({ tablero, ahora }: { tablero: Tablero; ahora: Date }) {
  const { hoy, mes, cuentasCorrientes, bajoMinimo } = tablero;
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Indicador
        titulo="Ventas de hoy"
        icono={TrendingUp}
        valor={formatearMoneda(hoy.importe)}
        detalle={plural(hoy.cantidad, "factura", "facturas")}
      />
      <Indicador
        titulo={`Ventas de ${NOMBRE_MES.format(ahora)}`}
        icono={CalendarDays}
        valor={formatearMoneda(mes.importe)}
        detalle={`${plural(mes.cantidad, "factura", "facturas")} · ticket promedio ${formatearMoneda(mes.ticketPromedio)}`}
      />
      <Indicador
        titulo="Deuda en cuentas corrientes"
        icono={Wallet}
        href="/clientes/saldos"
        valor={formatearMoneda(cuentasCorrientes.totalAdeudado)}
        detalle={plural(cuentasCorrientes.clientesConSaldo, "cliente con saldo", "clientes con saldo")}
      />
      <Indicador
        titulo="Bajo stock mínimo"
        icono={AlertTriangle}
        href="/productos?bajoMinimo=true"
        alerta={bajoMinimo.cantidad > 0}
        valor={String(bajoMinimo.cantidad)}
        detalle={bajoMinimo.cantidad === 0 ? "Todo el stock está en orden" : "Productos para reponer"}
      />
    </div>
  );
}
