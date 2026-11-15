// Primitivas de maquetación (sección 10.6): apilar, alinear, grilla, texto y título.
// Las páginas se arman con estas piezas, componentes de shadcn/ui y componentes del dominio,
// sin etiquetas HTML sueltas. Todo el estilo es Tailwind.
import type { ComponentProps, ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

const ESPACIOS = {
  0: "gap-0",
  1: "gap-1",
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  6: "gap-6",
  8: "gap-8",
} as const;

type Espacio = keyof typeof ESPACIOS;

type PropsContenedor = { children?: ReactNode; className?: string; espacio?: Espacio; como?: ElementType };

// Apila los hijos en vertical.
export function Pila({ children, className, espacio = 4, como: Como = "div" }: PropsContenedor) {
  return <Como className={cn("flex flex-col", ESPACIOS[espacio], className)}>{children}</Como>;
}

const ALINEACIONES = { inicio: "items-start", centro: "items-center", fin: "items-end", base: "items-baseline" } as const;
const JUSTIFICACIONES = { inicio: "justify-start", centro: "justify-center", fin: "justify-end", entre: "justify-between" } as const;

// Alinea los hijos en horizontal. Con `envolver` pasan a la línea siguiente en pantallas chicas.
export function Fila({
  children,
  className,
  espacio = 2,
  alinear = "centro",
  justificar = "inicio",
  envolver = false,
  como: Como = "div",
}: PropsContenedor & {
  alinear?: keyof typeof ALINEACIONES;
  justificar?: keyof typeof JUSTIFICACIONES;
  envolver?: boolean;
}) {
  return (
    <Como
      className={cn(
        "flex",
        ESPACIOS[espacio],
        ALINEACIONES[alinear],
        JUSTIFICACIONES[justificar],
        envolver && "flex-wrap",
        className,
      )}
    >
      {children}
    </Como>
  );
}

const COLUMNAS = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
} as const;

// Grilla adaptable: una columna en el teléfono y `columnas` en pantallas anchas.
export function Grilla({ children, className, espacio = 4, columnas = 2 }: PropsContenedor & { columnas?: keyof typeof COLUMNAS }) {
  return <div className={cn("grid", COLUMNAS[columnas], ESPACIOS[espacio], className)}>{children}</div>;
}

const VARIANTES_TEXTO = {
  normal: "text-sm text-foreground",
  suave: "text-sm text-muted-foreground",
  chico: "text-xs text-muted-foreground",
  fuerte: "text-sm font-medium text-foreground",
  error: "text-sm text-destructive",
} as const;

export function Texto({
  children,
  className,
  variante = "normal",
  como: Como = "p",
  ...resto
}: { variante?: keyof typeof VARIANTES_TEXTO; como?: ElementType } & ComponentProps<"p">) {
  return (
    <Como className={cn(VARIANTES_TEXTO[variante], className)} {...resto}>
      {children}
    </Como>
  );
}

const NIVELES = {
  1: "text-2xl font-semibold tracking-tight",
  2: "text-lg font-semibold tracking-tight",
  3: "text-base font-semibold",
} as const;

export function Titulo({ children, className, nivel = 1 }: { children: ReactNode; className?: string; nivel?: 1 | 2 | 3 }) {
  const Etiqueta = `h${nivel}` as const;
  return <Etiqueta className={cn(NIVELES[nivel], className)}>{children}</Etiqueta>;
}
