// Logotipo de la aplicación: el nombre de la tienda (DATOS_COMERCIO) con un ícono de celular.
import { Smartphone } from "lucide-react";
import { DATOS_COMERCIO } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Marca({ className, invertida = false }: { className?: string; invertida?: boolean }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-lg",
          invertida ? "bg-sidebar-primary text-sidebar-primary-foreground" : "bg-primary text-primary-foreground",
        )}
      >
        <Smartphone className="size-5" aria-hidden />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-base font-semibold tracking-tight">{DATOS_COMERCIO.nombre}</span>
        <span className={cn("text-[11px]", invertida ? "text-sidebar-foreground/70" : "text-muted-foreground")}>
          {DATOS_COMERCIO.rubro}
        </span>
      </span>
    </span>
  );
}
