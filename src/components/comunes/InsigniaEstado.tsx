// Insignias de estado reutilizables: activo/inactivo, rol, y más adelante emitida/anulada o bajo mínimo.
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const TONOS = {
  exito: "border-transparent bg-exito-suave text-exito",
  advertencia: "border-transparent bg-advertencia-suave text-advertencia",
  neutro: "border-transparent bg-muted text-muted-foreground",
  principal: "border-transparent bg-secondary text-secondary-foreground",
  peligro: "border-transparent bg-destructive/10 text-destructive",
} as const;

export type TonoInsignia = keyof typeof TONOS;

export function Insignia({ tono, children }: { tono: TonoInsignia; children: React.ReactNode }) {
  return (
    <Badge variant="outline" className={cn("font-medium", TONOS[tono])}>
      {children}
    </Badge>
  );
}

export function InsigniaActivo({ activo, femenino = false }: { activo: boolean; femenino?: boolean }) {
  return (
    <Insignia tono={activo ? "exito" : "neutro"}>
      {activo ? (femenino ? "Activa" : "Activo") : femenino ? "Inactiva" : "Inactivo"}
    </Insignia>
  );
}
