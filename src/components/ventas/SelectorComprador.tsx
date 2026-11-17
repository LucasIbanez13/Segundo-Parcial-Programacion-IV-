"use client";

// Comprador de la Nueva venta (RF-V2): por defecto Consumidor final, sin datos. Se puede buscar un cliente
// registrado por nombre o documento, o darlo de alta en un modal sin perder la venta en curso.
import { Search, UserPlus, UserRound, X } from "lucide-react";
import { forwardRef, useEffect, useState } from "react";
import { ClienteFormModal } from "@/components/clientes/ClienteFormModal";
import { InsigniaCuentaCorriente } from "@/components/clientes/InsigniasCliente";
import { Saldo } from "@/components/clientes/TablaClientes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { llamarApi } from "@/lib/http/resultado";
import { cn } from "@/lib/utils";
import type { ClientePublico, PaginaClientes } from "@/services/clientes.service";
import { Segmentos } from "./Segmentos";

type Modo = "final" | "registrado";

export const SelectorComprador = forwardRef<
  HTMLInputElement,
  { cliente: ClientePublico | null; onCambiar: (cliente: ClientePublico | null) => void; modo: Modo; onModo: (modo: Modo) => void }
>(function SelectorComprador({ cliente, onCambiar, modo, onModo }, ref) {
  const [texto, setTexto] = useState("");
  const [resultados, setResultados] = useState<ClientePublico[]>([]);
  const [elegido, setElegido] = useState(0);
  const [creando, setCreando] = useState(false);

  // Búsqueda por nombre o documento, solo clientes activos.
  useEffect(() => {
    const busqueda = texto.trim();
    if (!busqueda) {
      setResultados([]);
      return;
    }
    let vigente = true;
    const espera = setTimeout(async () => {
      const resultado = await llamarApi<PaginaClientes>(`/api/clientes?${new URLSearchParams({ q: busqueda, pageSize: "6" })}`);
      if (!vigente) return;
      setResultados(resultado.ok ? resultado.data.data : []);
      setElegido(0);
    }, 200);
    return () => {
      vigente = false;
      clearTimeout(espera);
    };
  }, [texto]);

  function elegir(nuevo: ClientePublico | undefined) {
    if (!nuevo) return;
    onCambiar(nuevo);
    setTexto("");
    setResultados([]);
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
      elegir(resultados[elegido]);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Segmentos
        etiqueta="Comprador"
        valor={modo}
        onCambiar={(nuevo) => {
          onModo(nuevo);
          if (nuevo === "final") onCambiar(null);
        }}
        opciones={[
          { valor: "final", texto: "Consumidor final" },
          { valor: "registrado", texto: "Cliente registrado" },
        ]}
      />

      {modo === "final" && (
        <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
          <UserRound className="mt-0.5 size-5 text-muted-foreground" />
          <div className="text-sm">
            <p className="font-medium">Consumidor final</p>
            <p className="text-muted-foreground">No requiere datos. No puede comprar en cuenta corriente.</p>
          </div>
        </div>
      )}

      {modo === "registrado" && cliente && (
        <div className="flex flex-col gap-2 rounded-lg border p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-medium">{cliente.nombre}</p>
              <p className="text-sm text-muted-foreground">
                {cliente.tipoDoc} {cliente.nroDoc}
              </p>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={() => onCambiar(null)}>
              <X /> Cambiar
            </Button>
          </div>
          <div className="flex items-center justify-between gap-2 text-sm">
            <InsigniaCuentaCorriente habilitada={cliente.cuentaCorriente} />
            <span className="ml-auto text-muted-foreground">
              Saldo <Saldo centavos={cliente.saldo} />
            </span>
          </div>
        </div>
      )}

      {modo === "registrado" && !cliente && (
        <div className="flex flex-col gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={ref}
              aria-label="Buscar cliente por nombre o documento"
              placeholder="Nombre, DNI o CUIT"
              className="pl-9"
              autoComplete="off"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={alPresionar}
            />
          </div>
          {texto.trim() && (
            <ul role="listbox" aria-label="Clientes" className="flex flex-col rounded-lg border p-1">
              {resultados.length === 0 ? (
                <li className="px-3 py-2 text-sm text-muted-foreground">No hay clientes activos que coincidan.</li>
              ) : (
                resultados.map((opcion, indice) => (
                  <li
                    key={opcion.id}
                    role="option"
                    aria-selected={indice === elegido}
                    onMouseEnter={() => setElegido(indice)}
                    onClick={() => elegir(opcion)}
                    className={cn("cursor-pointer rounded-md px-3 py-2 text-sm", indice === elegido && "bg-accent")}
                  >
                    <p className="font-medium">{opcion.nombre}</p>
                    <p className="text-xs text-muted-foreground">
                      {opcion.tipoDoc} {opcion.nroDoc}
                      {opcion.cuentaCorriente ? " · Cta. cte." : ""}
                    </p>
                  </li>
                ))
              )}
            </ul>
          )}
          <Button type="button" variant="outline" size="sm" className="self-start" onClick={() => setCreando(true)}>
            <UserPlus /> Nuevo cliente
          </Button>
        </div>
      )}

      {/* RF-V2: el alta en el momento no reinicia la venta; el cliente nuevo queda elegido. */}
      <ClienteFormModal open={creando} onOpenChange={setCreando} onSuccess={(nuevo) => onCambiar(nuevo)} />
    </div>
  );
});
