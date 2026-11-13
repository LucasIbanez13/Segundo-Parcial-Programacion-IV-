"use client";

// Búsqueda por nombre o email y filtro de estado. Escriben en la URL: el listado se recarga desde el servidor.
import { Search } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TODOS = "todos";
const ETIQUETAS_ESTADO: Record<string, string> = { [TODOS]: "Todos los estados", true: "Activos", false: "Inactivos" };

export function FiltrosUsuarios({ q, activo }: { q: string; activo: string }) {
  const router = useRouter();
  const ruta = usePathname();
  const [busqueda, setBusqueda] = useState(q);
  const [, iniciarTransicion] = useTransition();

  function navegar(cambios: { q?: string; activo?: string }) {
    const parametros = new URLSearchParams();
    const nuevoQ = cambios.q ?? busqueda;
    const nuevoActivo = cambios.activo ?? activo;
    if (nuevoQ.trim()) parametros.set("q", nuevoQ.trim());
    if (nuevoActivo) parametros.set("activo", nuevoActivo);
    const texto = parametros.toString();
    iniciarTransicion(() => router.replace(texto ? `${ruta}?${texto}` : ruta));
  }

  // Búsqueda en vivo con una pequeña espera para no recargar en cada tecla.
  useEffect(() => {
    if (busqueda === q) return;
    const espera = setTimeout(() => navegar({ q: busqueda }), 300);
    return () => clearTimeout(espera);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busqueda]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscá por nombre o email"
          aria-label="Buscar usuarios"
          className="pl-9"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>
      <Select value={activo || TODOS} onValueChange={(valor) => navegar({ activo: valor === TODOS ? "" : valor })}>
        <SelectTrigger className="w-full sm:w-44" aria-label="Filtrar por estado">
          <SelectValue>{ETIQUETAS_ESTADO[activo || TODOS]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={TODOS}>Todos los estados</SelectItem>
          <SelectItem value="true">Activos</SelectItem>
          <SelectItem value="false">Inactivos</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
