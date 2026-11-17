"use client";

// Filtros del listado de facturas (RF-V8): número o cliente, rango de fechas, cliente, forma de pago,
// vendedor y estado. Todo vive en la URL (sección 10.6): el listado se recarga desde el servidor.
import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ESTADOS_FACTURA, ETIQUETAS_FORMA_PAGO, FORMAS_PAGO } from "@/lib/constants";

type Opcion = { id: number; nombre: string };

// Los Select de shadcn no aceptan un valor vacío: "todos" significa "sin filtro".
const TODOS = "todos";

function Filtro({
  valor,
  onCambiar,
  etiquetaTodos,
  opciones,
  nombre,
}: {
  valor: string;
  onCambiar: (valor: string) => void;
  etiquetaTodos: string;
  opciones: { valor: string; texto: string }[];
  nombre: string;
}) {
  const elegida = opciones.find((opcion) => opcion.valor === valor);
  return (
    <Select value={valor || TODOS} onValueChange={(nuevo) => onCambiar(nuevo === TODOS ? "" : nuevo)}>
      <SelectTrigger className="w-full sm:w-52" aria-label={nombre}>
        <SelectValue>{elegida?.texto ?? etiquetaTodos}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={TODOS}>{etiquetaTodos}</SelectItem>
        {opciones.map((opcion) => (
          <SelectItem key={opcion.valor} value={opcion.valor}>
            {opcion.texto}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function FiltrosFacturas({ clientes, vendedores }: { clientes: Opcion[]; vendedores: Opcion[] }) {
  const router = useRouter();
  const ruta = usePathname();
  const parametros = useSearchParams();
  const q = parametros.get("q") ?? "";
  const [busqueda, setBusqueda] = useState(q);
  const [, iniciarTransicion] = useTransition();

  function navegar(cambios: Record<string, string>) {
    const nuevos = new URLSearchParams(parametros.toString());
    for (const [clave, valor] of Object.entries(cambios)) {
      if (valor) nuevos.set(clave, valor);
      else nuevos.delete(clave);
    }
    nuevos.delete("page");
    const texto = nuevos.toString();
    iniciarTransicion(() => router.replace(texto ? `${ruta}?${texto}` : ruta));
  }

  // Búsqueda en vivo con una pequeña espera para no recargar en cada tecla.
  useEffect(() => {
    if (busqueda === q) return;
    const espera = setTimeout(() => navegar({ q: busqueda.trim() }), 300);
    return () => clearTimeout(espera);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busqueda]);

  const desde = parametros.get("desde") ?? "";
  const hasta = parametros.get("hasta") ?? "";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Número o cliente"
            aria-label="Buscar facturas"
            className="pl-9"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
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
            onChange={(e) => navegar({ desde: e.target.value })}
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
            onChange={(e) => navegar({ hasta: e.target.value })}
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <Filtro
          nombre="Filtrar por cliente"
          etiquetaTodos="Todos los clientes"
          valor={parametros.get("clienteId") ?? ""}
          onCambiar={(valor) => navegar({ clienteId: valor })}
          opciones={clientes.map((cliente) => ({ valor: String(cliente.id), texto: cliente.nombre }))}
        />
        <Filtro
          nombre="Filtrar por forma de pago"
          etiquetaTodos="Todas las formas de pago"
          valor={parametros.get("forma") ?? ""}
          onCambiar={(valor) => navegar({ forma: valor })}
          opciones={FORMAS_PAGO.map((forma) => ({ valor: forma, texto: ETIQUETAS_FORMA_PAGO[forma] }))}
        />
        <Filtro
          nombre="Filtrar por vendedor"
          etiquetaTodos="Todos los vendedores"
          valor={parametros.get("vendedorId") ?? ""}
          onCambiar={(valor) => navegar({ vendedorId: valor })}
          opciones={vendedores.map((vendedor) => ({ valor: String(vendedor.id), texto: vendedor.nombre }))}
        />
        <Filtro
          nombre="Filtrar por estado"
          etiquetaTodos="Todos los estados"
          valor={parametros.get("estado") ?? ""}
          onCambiar={(valor) => navegar({ estado: valor })}
          opciones={ESTADOS_FACTURA.map((estado) => ({ valor: estado, texto: estado === "emitida" ? "Emitidas" : "Anuladas" }))}
        />
      </div>
    </div>
  );
}
