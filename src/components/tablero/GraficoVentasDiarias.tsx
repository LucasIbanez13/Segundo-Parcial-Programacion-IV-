"use client";

// Gráfico de barras de ventas diarias de los últimos 30 días (RF-T2). La barra de hoy va destacada.
// Eje X en dd/mm, eje Y y tooltips en pesos argentinos.
import { BarElement, CategoryScale, Chart as ChartJS, LinearScale, Tooltip, type ChartOptions } from "chart.js";
import { Bar } from "react-chartjs-2";
import { formatearMoneda } from "@/lib/format";
import { conAlfa, useColoresTema } from "./useColoresTema";
import { pesosCompactos } from "./pesosCompactos";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

// "2026-11-09" -> "09/11".
function diaMes(fecha: string): string {
  const [, mes, dia] = fecha.split("-");
  return `${dia}/${mes}`;
}

export function GraficoVentasDiarias({ dias }: { dias: { fecha: string; importe: number }[] }) {
  const colores = useColoresTema();
  const ultimo = dias.length - 1;

  const opciones: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (items) => {
            const fecha = dias[items[0].dataIndex].fecha;
            return items[0].dataIndex === ultimo ? `${diaMes(fecha)} (hoy)` : diaMes(fecha);
          },
          label: (item) => formatearMoneda(Number(item.raw)),
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { color: colores.border },
        ticks: { color: colores["muted-foreground"], maxRotation: 0, autoSkip: true, maxTicksLimit: 8, font: { size: 11 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: colores.border },
        border: { display: false },
        ticks: { color: colores["muted-foreground"], maxTicksLimit: 5, font: { size: 11 }, callback: (valor) => pesosCompactos(Number(valor)) },
      },
    },
  };

  return (
    <div className="h-64 w-full">
      <Bar
        aria-label="Gráfico de barras con las ventas de cada día de los últimos 30 días"
        role="img"
        options={opciones}
        data={{
          labels: dias.map((dia) => diaMes(dia.fecha)),
          datasets: [
            {
              data: dias.map((dia) => dia.importe),
              backgroundColor: dias.map((_, indice) => (indice === ultimo ? colores.primary : conAlfa(colores.primary, 0.35))),
              hoverBackgroundColor: colores.primary,
              borderRadius: 4,
              maxBarThickness: 28,
            },
          ],
        }}
      />
    </div>
  );
}
