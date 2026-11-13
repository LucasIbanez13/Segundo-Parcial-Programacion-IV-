// Diseño de la pantalla de ingreso: panel de marca a la izquierda (oculto en el teléfono) y formulario.
import { BarChart3, Boxes, ReceiptText, Users } from "lucide-react";
import type { ReactNode } from "react";
import { Marca } from "@/components/layout/Marca";

const PUNTOS = [
  { icono: ReceiptText, texto: "Facturación rápida en el mostrador" },
  { icono: Boxes, texto: "Stock al día con cada venta" },
  { icono: Users, texto: "Cuentas corrientes de tus clientes" },
  { icono: BarChart3, texto: "Indicadores del negocio en el tablero" },
];

export function PanelLogin({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-svh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <section className="relative hidden flex-col justify-between overflow-hidden bg-sidebar p-10 text-sidebar-foreground lg:flex">
        <Marca invertida />
        <div className="flex flex-col gap-6">
          <h2 className="max-w-md text-3xl font-semibold leading-tight tracking-tight text-sidebar-accent-foreground">
            Todo tu comercio en un solo lugar.
          </h2>
          <ul className="flex flex-col gap-3">
            {PUNTOS.map(({ icono: Icono, texto }) => (
              <li key={texto} className="flex items-center gap-3 text-sm">
                <span className="grid size-8 place-items-center rounded-md bg-sidebar-accent">
                  <Icono className="size-4 text-sidebar-primary" aria-hidden />
                </span>
                {texto}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-sidebar-foreground/60">2º Parcial · Programación IV</p>
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -bottom-24 size-80 rounded-full bg-sidebar-primary/10 blur-2xl"
        />
      </section>
      <section className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="flex w-full max-w-sm flex-col gap-8">
          <Marca className="lg:hidden" />
          {children}
        </div>
      </section>
    </main>
  );
}
