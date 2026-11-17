// Tabla de saldos (RF-C6): posición, cliente, documento, límite y saldo, con el total adeudado al pie.
import Link from "next/link";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatearMoneda } from "@/lib/format";
import type { ClientePublico } from "@/services/clientes.service";
import { Saldo } from "./TablaClientes";

export function TablaSaldos({ clientes, desde, total }: { clientes: ClientePublico[]; desde: number; total: number }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">#</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead className="hidden sm:table-cell">Documento</TableHead>
          <TableHead className="hidden text-right md:table-cell">Límite</TableHead>
          <TableHead className="text-right">Saldo</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clientes.map((cliente, indice) => (
          <TableRow key={cliente.id}>
            <TableCell className="text-muted-foreground tabular-nums">{desde + indice + 1}</TableCell>
            <TableCell>
              <Link href={`/clientes/${cliente.id}`} className="font-medium hover:underline">
                {cliente.nombre}
              </Link>
            </TableCell>
            <TableCell className="hidden tabular-nums sm:table-cell">
              {cliente.tipoDoc} {cliente.nroDoc}
            </TableCell>
            <TableCell className="hidden text-right tabular-nums md:table-cell">
              {cliente.limiteCredito === null ? "Sin límite" : formatearMoneda(cliente.limiteCredito)}
            </TableCell>
            <TableCell className="text-right">
              <Saldo centavos={cliente.saldo} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={2} className="font-medium">
            Total adeudado
          </TableCell>
          <TableCell className="hidden sm:table-cell" />
          <TableCell className="hidden md:table-cell" />
          <TableCell className="text-right font-semibold tabular-nums">{formatearMoneda(total)}</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}
