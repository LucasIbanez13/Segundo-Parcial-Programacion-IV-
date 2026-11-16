"use client";

// Filtros del listado general de movimientos (RF-P6): tipo y rango de fechas (AAAA-MM-DD, hora de Argentina).
// Escriben en la URL: el listado se recarga desde el servidor.
import { X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ETIQUETAS_TIPO_MOVIMIENTO, TIPOS_MOVIMIENTO_STOCK, type TipoMovimientoStock } from "@/lib/constants";

const TODOS = "todos";
type Filtros = { tipo: string; desde: string; hasta: string; productoId: string };

export function FiltrosMovimientos({ filtros }: { filtros: Filtros }) {
  const router = useRouter();
  const ruta = usePathname();
  const [, iniciarTransicion] = useTransition();

  function navegar(cambios: Partial<Filtros>) {
    const nuevos = { ...filtros, ...cambios };
    const parametros = new URLSearchParams();
    for (const [clave, valor] of Object.entries(nuevos)) if (valor) parametros.set(clave, valor);
    const texto = parametros.toString();
    iniciarTransicion(() => router.replace(texto ? `${ruta}?${texto}` : ruta));
  }

  const hayFiltros = Object.values(filtros).some(Boolean);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:items-end">
      <Select value={filtros.tipo || TODOS} onValueChange={(valor) => navegar({ tipo: valor === TODOS ? "" : valor })}>
        <SelectTrigger className="w-full lg:w-48" aria-label="Filtrar por tipo">
          <SelectValue>
            {filtros.tipo ? ETIQUETAS_TIPO_MOVIMIENTO[filtros.tipo as TipoMovimientoStock] : "Todos los tipos"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={TODOS}>Todos los tipos</SelectItem>
          {TIPOS_MOVIMIENTO_STOCK.map((tipo) => (
            <SelectItem key={tipo} value={tipo}>
              {ETIQUETAS_TIPO_MOVIMIENTO[tipo]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        type="date"
        aria-label="Desde"
        title="Desde"
        className="w-full lg:w-44"
        value={filtros.desde}
        max={filtros.hasta || undefined}
        onChange={(e) => navegar({ desde: e.target.value })}
      />
      <Input
        type="date"
        aria-label="Hasta"
        title="Hasta"
        className="w-full lg:w-44"
        value={filtros.hasta}
        min={filtros.desde || undefined}
        onChange={(e) => navegar({ hasta: e.target.value })}
      />
      {hayFiltros && (
        <Button variant="ghost" onClick={() => navegar({ tipo: "", desde: "", hasta: "", productoId: "" })}>
          <X /> Limpiar filtros
        </Button>
      )}
    </div>
  );
}
