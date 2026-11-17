"use client";

// Filtro por rango de días de la cuenta corriente (RF-C4). Vive en la URL como desde y hasta (AAAA-MM-DD)
// y se aplica apenas se elige una fecha.
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function FiltroFechasCuenta({ desde, hasta }: { desde: string; hasta: string }) {
  const router = useRouter();
  const ruta = usePathname();
  const [aplicando, iniciarTransicion] = useTransition();

  function navegar(filtro: { desde: string; hasta: string }) {
    const parametros = new URLSearchParams();
    if (filtro.desde) parametros.set("desde", filtro.desde);
    if (filtro.hasta) parametros.set("hasta", filtro.hasta);
    const texto = parametros.toString();
    iniciarTransicion(() => router.replace(texto ? `${ruta}?${texto}` : ruta, { scroll: false }));
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <Label htmlFor="desde" className="font-normal text-muted-foreground">
          Desde
        </Label>
        <Input
          id="desde"
          type="date"
          className="w-40"
          value={desde}
          max={hasta || undefined}
          onChange={(e) => navegar({ desde: e.target.value, hasta })}
        />
      </div>
      <div className="flex items-center gap-2">
        <Label htmlFor="hasta" className="font-normal text-muted-foreground">
          Hasta
        </Label>
        <Input
          id="hasta"
          type="date"
          className="w-40"
          value={hasta}
          min={desde || undefined}
          onChange={(e) => navegar({ desde, hasta: e.target.value })}
        />
      </div>
      {(desde || hasta) && (
        <Button variant="ghost" size="sm" onClick={() => navegar({ desde: "", hasta: "" })} disabled={aplicando}>
          Ver todo
        </Button>
      )}
    </div>
  );
}
