// Estados de los listados (sección 8: "cada listado contempla carga, vacío y error").
import { AlertTriangle, Inbox } from "lucide-react";
import type { ReactNode } from "react";
import { Pila, Texto } from "@/components/base/primitivas";
import { Skeleton } from "@/components/ui/skeleton";

export function EstadoVacio({ titulo, descripcion, accion }: { titulo: string; descripcion?: string; accion?: ReactNode }) {
  return (
    <Pila espacio={3} className="items-center rounded-lg border border-dashed px-6 py-12 text-center">
      <Inbox className="size-8 text-muted-foreground" aria-hidden />
      <Pila espacio={1} className="items-center">
        <Texto variante="fuerte">{titulo}</Texto>
        {descripcion && <Texto variante="suave">{descripcion}</Texto>}
      </Pila>
      {accion}
    </Pila>
  );
}

export function EstadoError({ mensaje }: { mensaje: string }) {
  return (
    <Pila
      espacio={2}
      className="items-center rounded-lg border border-destructive/30 bg-destructive/5 px-6 py-10 text-center"
    >
      <AlertTriangle className="size-7 text-destructive" aria-hidden />
      <Texto variante="fuerte">No pudimos cargar la información</Texto>
      <Texto variante="suave">{mensaje}</Texto>
    </Pila>
  );
}

// Esqueleto de una tabla mientras carga (se usa en los loading.tsx).
export function CargandoTabla({ filas = 6 }: { filas?: number }) {
  return (
    <Pila espacio={2} aria-busy="true" aria-label="Cargando">
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: filas }, (_, indice) => (
        <Skeleton key={indice} className="h-12 w-full" />
      ))}
    </Pila>
  );
}
