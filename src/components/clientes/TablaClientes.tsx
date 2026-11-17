// Tabla del listado de clientes (RF-C1): documento, nombre, teléfono, cuenta corriente y saldo.
// El nombre lleva a la ficha, donde están las acciones. En el teléfono el documento pasa debajo del nombre.
import Link from "next/link";
import { Fila, Pila, Texto } from "@/components/base/primitivas";
import { InsigniaActivo } from "@/components/comunes/InsigniaEstado";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatearMoneda } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ClientePublico } from "@/services/clientes.service";
import { InsigniaCuentaCorriente } from "./InsigniasCliente";

export function Documento({ cliente }: { cliente: Pick<ClientePublico, "tipoDoc" | "nroDoc"> }) {
  return (
    <span className="whitespace-nowrap tabular-nums">
      <span className="mr-1.5 text-xs text-muted-foreground">{cliente.tipoDoc}</span>
      {cliente.nroDoc}
    </span>
  );
}

// Saldo en rojo cuando el cliente debe (regla 7).
export function Saldo({ centavos, className }: { centavos: number; className?: string }) {
  return <span className={cn("tabular-nums", centavos > 0 && "text-destructive", className)}>{formatearMoneda(centavos)}</span>;
}

export function TablaClientes({ clientes }: { clientes: ClientePublico[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="hidden md:table-cell">Documento</TableHead>
          <TableHead>Nombre o razón social</TableHead>
          <TableHead className="hidden lg:table-cell">Teléfono</TableHead>
          <TableHead className="hidden sm:table-cell">Cuenta</TableHead>
          <TableHead className="text-right">Saldo</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clientes.map((cliente) => (
          <TableRow key={cliente.id}>
            <TableCell className="hidden md:table-cell">
              <Documento cliente={cliente} />
            </TableCell>
            <TableCell>
              <Pila espacio={0}>
                <Fila espacio={2} envolver>
                  <Link href={`/clientes/${cliente.id}`} className="font-medium hover:underline">
                    {cliente.nombre}
                  </Link>
                  {!cliente.activo && <InsigniaActivo activo={false} />}
                </Fila>
                <Texto variante="chico" className="md:hidden">
                  {cliente.tipoDoc} {cliente.nroDoc}
                </Texto>
              </Pila>
            </TableCell>
            <TableCell className="hidden tabular-nums lg:table-cell">{cliente.telefono ?? "—"}</TableCell>
            <TableCell className="hidden sm:table-cell">
              <InsigniaCuentaCorriente habilitada={cliente.cuentaCorriente} />
            </TableCell>
            <TableCell className="text-right">
              <Saldo centavos={cliente.saldo} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
