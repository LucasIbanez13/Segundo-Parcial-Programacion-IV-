"use client";

// Filtros del catálogo (RF-P1): búsqueda por código o descripción, categoría, bajo mínimo y, para el admin, estado.
// Escriben en la URL: el listado se recarga desde el servidor y se puede compartir.
import { Search } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CategoriaPublica } from "@/services/categorias.service";

const TODAS = "todas";
const ETIQUETAS_STOCK: Record<string, string> = { todos: "Todo el stock", true: "Bajo el mínimo" };
const ETIQUETAS_ESTADO: Record<string, string> = { true: "Activos", false: "Inactivos", todos: "Todos los estados" };

type Filtros = { q: string; categoriaId: string; bajoMinimo: string; activo: string };

export function FiltrosProductos({
  filtros,
  categorias,
  mostrarEstado,
}: {
  filtros: Filtros;
  categorias: CategoriaPublica[];
  mostrarEstado: boolean;
}) {
  const router = useRouter();
  const ruta = usePathname();
  const [busqueda, setBusqueda] = useState(filtros.q);
  const [, iniciarTransicion] = useTransition();

  function navegar(cambios: Partial<Filtros>) {
    const nuevos = { ...filtros, q: busqueda, ...cambios };
    const parametros = new URLSearchParams();
    if (nuevos.q.trim()) parametros.set("q", nuevos.q.trim());
    if (nuevos.categoriaId) parametros.set("categoriaId", nuevos.categoriaId);
    if (nuevos.bajoMinimo === "true") parametros.set("bajoMinimo", "true");
    if (nuevos.activo && nuevos.activo !== "true") parametros.set("activo", nuevos.activo);
    const texto = parametros.toString();
    iniciarTransicion(() => router.replace(texto ? `${ruta}?${texto}` : ruta));
  }

  // Búsqueda en vivo con una pequeña espera para no recargar en cada tecla.
  useEffect(() => {
    if (busqueda === filtros.q) return;
    const espera = setTimeout(() => navegar({ q: busqueda }), 300);
    return () => clearTimeout(espera);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busqueda]);

  const categoriaElegida = categorias.find((categoria) => String(categoria.id) === filtros.categoriaId);

  return (
    <div className="flex flex-col gap-3 xl:flex-row">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscá por código o descripción"
          aria-label="Buscar productos"
          className="pl-9"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:flex">
        <Select
          value={filtros.categoriaId || TODAS}
          onValueChange={(valor) => navegar({ categoriaId: valor === TODAS ? "" : valor })}
        >
          <SelectTrigger className="w-full xl:w-48" aria-label="Filtrar por categoría">
            <SelectValue>{categoriaElegida?.nombre ?? "Todas las categorías"}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODAS}>Todas las categorías</SelectItem>
            {categorias.map((categoria) => (
              <SelectItem key={categoria.id} value={String(categoria.id)}>
                {categoria.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filtros.bajoMinimo === "true" ? "true" : "todos"}
          onValueChange={(valor) => navegar({ bajoMinimo: valor === "true" ? "true" : "" })}
        >
          <SelectTrigger className="w-full xl:w-40" aria-label="Filtrar por stock">
            <SelectValue>{ETIQUETAS_STOCK[filtros.bajoMinimo === "true" ? "true" : "todos"]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todo el stock</SelectItem>
            <SelectItem value="true">Bajo el mínimo</SelectItem>
          </SelectContent>
        </Select>
        {mostrarEstado && (
          <Select value={filtros.activo || "true"} onValueChange={(valor) => navegar({ activo: valor })}>
            <SelectTrigger className="w-full xl:w-44" aria-label="Filtrar por estado">
              <SelectValue>{ETIQUETAS_ESTADO[filtros.activo || "true"]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Activos</SelectItem>
              <SelectItem value="false">Inactivos</SelectItem>
              <SelectItem value="todos">Todos los estados</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
}
