"use client";

// Gráfico de anillo con las ventas del mes por forma de pago (RF-T2): total en el centro y, al costado,
// cada forma con su color, porcentaje sobre el total e importe en pesos.
import { ArcElement, Chart as ChartJS, Tooltip, type ChartOptions } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { ETIQUETAS_FORMA_PAGO, type FormaPago } from "@/lib/constants";
import { formatearMoneda } from "@/lib/format";
import { useColoresTema, type ColoresTema } from "./useColoresTema";
import { pesosCompactos } from "./pesosCompactos";

ChartJS.register(ArcElement, Tooltip);

function colorDe(forma: FormaPago, colores: ColoresTema): string {
  if (forma === "contado") return colores.primary;
  if (forma === "tarjeta") return colores.advertencia;
  return colores["muted-foreground"];
}

export function GraficoFormasPago({ formas }: { formas: { forma: FormaPago; importe: number }[] }) {
  const colores = useColoresTema();
  const total = formas.reduce((suma, { importe }) => suma + importe, 0);

  const opciones: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "68%",
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: { label: (item) => `${item.label}: ${formatearMoneda(Number(item.raw))}` },
      },
    },
  };

  return (
    // El layout depende del ancho de la tarjeta (container query), no de la pantalla: la leyenda va al costado
    // del anillo solo si entra; si no, se apila debajo. Nada se sale del recuadro.
    <div className="@container w-full min-w-0">
      <div className="flex flex-col items-center gap-6 @lg:flex-row">
        <div className="relative size-40 shrink-0 sm:size-44">
          <Doughnut
            aria-label="Gráfico de anillo con las ventas del mes por forma de pago"
            role="img"
            options={opciones}
            data={{
              labels: formas.map(({ forma }) => ETIQUETAS_FORMA_PAGO[forma]),
              datasets: [
                {
                  data: formas.map(({ importe }) => importe),
                  backgroundColor: formas.map(({ forma }) => colorDe(forma, colores)),
                  borderColor: colores.card,
                  borderWidth: 2,
                },
              ],
            }}
          />
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs text-muted-foreground">Total</span>
            <span className="font-semibold tabular-nums">{pesosCompactos(total)}</span>
          </div>
        </div>

        {/* Grilla de 4 columnas: punto, nombre (se puede partir en dos renglones), porcentaje e importe completo. */}
        <ul className="grid w-full min-w-0 flex-1 grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-x-2 gap-y-3 text-xs sm:text-sm">
          {formas.map(({ forma, importe }) => (
            <li key={forma} className="col-span-4 grid grid-cols-subgrid items-center">
              <span aria-hidden className="size-3 rounded-full" style={{ backgroundColor: colorDe(forma, colores) }} />
              <span className="min-w-0 break-words">{ETIQUETAS_FORMA_PAGO[forma]}</span>
              <span className="text-right text-muted-foreground tabular-nums">
                {total === 0 ? 0 : Math.round((importe / total) * 100)}%
              </span>
              <span className="text-right font-medium whitespace-nowrap tabular-nums">{formatearMoneda(importe)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
