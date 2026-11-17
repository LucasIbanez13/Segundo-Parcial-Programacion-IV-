"use client";

// Selector de una opción entre pocas (comprador, forma de pago, tipo de tarjeta), como botones segmentados.
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Segmentos<V extends string>({
  valor,
  opciones,
  onCambiar,
  etiqueta,
}: {
  valor: V;
  opciones: { valor: V; texto: ReactNode; deshabilitada?: boolean; motivo?: string }[];
  onCambiar: (valor: V) => void;
  etiqueta: string;
}) {
  return (
    <div role="radiogroup" aria-label={etiqueta} className="flex w-full rounded-lg bg-muted p-1">
      {opciones.map((opcion) => {
        const activa = opcion.valor === valor;
        return (
          <button
            key={opcion.valor}
            type="button"
            role="radio"
            aria-checked={activa}
            disabled={opcion.deshabilitada}
            title={opcion.deshabilitada ? opcion.motivo : undefined}
            onClick={() => onCambiar(opcion.valor)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:size-4",
              activa ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {opcion.texto}
          </button>
        );
      })}
    </div>
  );
}
