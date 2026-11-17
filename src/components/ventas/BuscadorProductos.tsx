"use client";

// Búsqueda de productos de la Nueva venta (RF-V3): por código o descripción, con la cantidad a agregar.
// Se maneja con teclado: ↑ ↓ eligen y Enter agrega. Muestra la existencia disponible (RF-V4).
import { Search } from "lucide-react";
import { forwardRef, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { formatearMoneda } from "@/lib/format";
import { llamarApi } from "@/lib/http/resultado";
import type { Pagina } from "@/lib/schemas/comun";
import { cn } from "@/lib/utils";
import type { ProductoPublico } from "@/services/productos.service";

export type ProductoVenta = Pick<ProductoPublico, "id" | "codigo" | "descripcion" | "precio" | "existencia">;

export const BuscadorProductos = forwardRef<
  HTMLInputElement,
  { onAgregar: (producto: ProductoVenta, cantidad: number) => void; cantidadEnVenta: (productoId: number) => number }
>(function BuscadorProductos({ onAgregar, cantidadEnVenta }, ref) {
  const [texto, setTexto] = useState("");
  const [cantidad, setCantidad] = useState("1");
  const [resultados, setResultados] = useState<ProductoVenta[]>([]);
  const [elegido, setElegido] = useState(0);
  const [abierto, setAbierto] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [buscando, setBuscando] = useState(false);

  // Búsqueda con una pequeña espera para no consultar en cada tecla. Solo productos activos (RF-P3).
  useEffect(() => {
    const busqueda = texto.trim();
    if (!busqueda) {
      setResultados([]);
      return;
    }
    let vigente = true;
    setBuscando(true);
    const espera = setTimeout(async () => {
      const resultado = await llamarApi<Pagina<ProductoPublico>>(
        `/api/productos?${new URLSearchParams({ q: busqueda, pageSize: "8" })}`,
      );
      if (!vigente) return;
      setResultados(resultado.ok ? resultado.data.data : []);
      setElegido(0);
      setAbierto(true);
      setBuscando(false);
    }, 200);
    return () => {
      vigente = false;
      clearTimeout(espera);
    };
  }, [texto]);

  function agregar(producto: ProductoVenta | undefined) {
    if (!producto) return;
    const pedida = Number(cantidad);
    if (!Number.isInteger(pedida) || pedida <= 0) {
      setAviso("La cantidad debe ser un número entero mayor que cero.");
      return;
    }
    // RF-V4: no se permite superar la existencia, contando lo que ya está en la venta.
    const disponible = producto.existencia - cantidadEnVenta(producto.id);
    if (pedida > disponible) {
      setAviso(
        disponible <= 0
          ? `No queda stock de ${producto.descripcion} para agregar.`
          : `Solo hay ${disponible} disponibles de ${producto.descripcion}.`,
      );
      return;
    }
    onAgregar(producto, pedida);
    setTexto("");
    setCantidad("1");
    setResultados([]);
    setAbierto(false);
    setAviso(null);
  }

  function alPresionar(evento: React.KeyboardEvent) {
    if (evento.key === "ArrowDown") {
      evento.preventDefault();
      setElegido((actual) => Math.min(actual + 1, resultados.length - 1));
    } else if (evento.key === "ArrowUp") {
      evento.preventDefault();
      setElegido((actual) => Math.max(actual - 1, 0));
    } else if (evento.key === "Enter") {
      evento.preventDefault();
      agregar(resultados[elegido]);
    } else if (evento.key === "Escape") {
      setAbierto(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-3">
        <Input
          aria-label="Cantidad a agregar"
          inputMode="numeric"
          className="w-20 text-center"
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value.replace(/\D/g, ""))}
        />
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={ref}
            role="combobox"
            aria-expanded={abierto && resultados.length > 0}
            aria-controls="resultados-productos"
            aria-label="Buscar producto por código o descripción"
            placeholder="Buscá por código o descripción"
            className="pl-9"
            autoComplete="off"
            value={texto}
            onChange={(e) => {
              setTexto(e.target.value);
              setAviso(null);
            }}
            onKeyDown={alPresionar}
            onFocus={() => setAbierto(true)}
            onBlur={() => setTimeout(() => setAbierto(false), 150)}
          />
          {abierto && texto.trim() && (
            <ul
              id="resultados-productos"
              role="listbox"
              className="absolute inset-x-0 top-full z-20 mt-1 max-h-80 overflow-y-auto rounded-lg border bg-popover p-1 shadow-lg"
            >
              {resultados.length === 0 ? (
                <li className="px-3 py-2 text-sm text-muted-foreground">
                  {buscando ? "Buscando…" : "No hay productos activos que coincidan."}
                </li>
              ) : (
                resultados.map((producto, indice) => (
                  <li
                    key={producto.id}
                    role="option"
                    aria-selected={indice === elegido}
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseEnter={() => setElegido(indice)}
                    onClick={() => agregar(producto)}
                    className={cn(
                      "flex cursor-pointer items-center justify-between gap-3 rounded-md px-3 py-2",
                      indice === elegido && "bg-accent",
                    )}
                  >
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-sm">
                        <span className="mr-2 font-mono text-xs text-muted-foreground">{producto.codigo}</span>
                        {producto.descripcion}
                      </span>
                      <span className={cn("text-xs", producto.existencia === 0 ? "text-destructive" : "text-muted-foreground")}>
                        {producto.existencia === 0 ? "Sin stock" : `Disponible: ${producto.existencia}`}
                      </span>
                    </span>
                    <span className="text-sm whitespace-nowrap tabular-nums">{formatearMoneda(producto.precio)}</span>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      </div>
      {aviso && <p className="text-sm text-destructive">{aviso}</p>}
    </div>
  );
});
