"use client";

// Búsqueda en vivo, estado y "Solo con deuda" del listado de clientes (RF-C1). Todo vive en la URL
// (sección 10.6): el listado se recarga desde el servidor y se puede compartir.
import { Search } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const ETIQUETAS_ESTADO: Record<string, string> = { true: "Activos", false: "Dados de baja", todos: "Todos" };

type Filtros = { q: string; activo: string; conDeuda: boolean };

export function FiltrosClientes({ q, activo, conDeuda }: Filtros) {
  const router = useRouter();
  const ruta = usePathname();
  const [busqueda, setBusqueda] = useState(q);
  const [, iniciarTransicion] = useTransition();

  function navegar(cambios: Partial<Filtros>) {
    const filtros = { q: busqueda, activo, conDeuda, ...cambios };
    const parametros = new URLSearchParams();
    if (filtros.q.trim()) parametros.set("q", filtros.q.trim());
    if (filtros.activo && filtros.activo !== "true") parametros.set("activo", filtros.activo);
    if (filtros.conDeuda) parametros.set("conDeuda", "true");
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
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative sm:w-72">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Nombre, DNI o CUIT"
          aria-label="Buscar clientes"
          className="pl-9"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>
      <Select value={activo || "true"} onValueChange={(valor) => navegar({ activo: valor })}>
        <SelectTrigger className="w-full sm:w-40" aria-label="Filtrar por estado">
          <SelectValue>{ETIQUETAS_ESTADO[activo || "true"]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="true">Activos</SelectItem>
          <SelectItem value="false">Dados de baja</SelectItem>
          <SelectItem value="todos">Todos</SelectItem>
        </SelectContent>
      </Select>
      <div className="flex items-center gap-2">
        <Switch id="con-deuda" checked={conDeuda} onCheckedChange={(valor) => navegar({ conDeuda: valor })} />
        <Label htmlFor="con-deuda">Solo con deuda</Label>
      </div>
    </div>
  );
}
