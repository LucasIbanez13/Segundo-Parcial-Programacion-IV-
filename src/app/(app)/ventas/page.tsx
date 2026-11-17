// /ventas — listado de facturas (RF-V8) con filtros y paginado en la URL. Server Component que llama a los servicios.
import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { EncabezadoPagina } from "@/components/comunes/EncabezadoPagina";
import { EstadoError, EstadoVacio } from "@/components/comunes/Estados";
import { Paginador } from "@/components/comunes/Paginador";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FiltrosFacturas } from "@/components/ventas/FiltrosFacturas";
import { TablaFacturas } from "@/components/ventas/TablaFacturas";
import { getCurrentUser } from "@/lib/auth/sesion";
import { ApiError } from "@/lib/errors";
import { formatearMoneda } from "@/lib/format";
import { listarClientes, type PaginaClientes } from "@/services/clientes.service";
import { listarFacturas, listarVendedores, type PaginaFacturas } from "@/services/facturas.service";

export const metadata: Metadata = { title: "Facturas" };

type Parametros = {
  q?: string;
  desde?: string;
  hasta?: string;
  clienteId?: string;
  vendedorId?: string;
  forma?: string;
  estado?: string;
  page?: string;
};

function BotonNuevaVenta() {
  return (
    <Button asChild>
      <Link href="/ventas/nueva">
        <Plus /> Nueva venta
      </Link>
    </Button>
  );
}

export default async function PaginaFacturas({ searchParams }: { searchParams: Promise<Parametros> }) {
  const usuario = await getCurrentUser();
  if (!usuario) redirect("/login");
  const parametros = await searchParams;

  let pagina: PaginaFacturas;
  let clientes: PaginaClientes;
  let vendedores: { id: number; nombre: string }[];
  try {
    [pagina, clientes, vendedores] = await Promise.all([
      listarFacturas(usuario, parametros),
      listarClientes(usuario, { activo: "todos", pageSize: "100" }),
      listarVendedores(usuario),
    ]);
  } catch (error) {
    if (error instanceof ApiError) return <EstadoError mensaje={error.message} />;
    throw error;
  }

  const { page: _pagina, ...filtros } = parametros;
  const hayFiltros = Object.values(filtros).some(Boolean);
  const cantidad = `${pagina.total} ${pagina.total === 1 ? "comprobante" : "comprobantes"}`;

  return (
    <>
      <EncabezadoPagina
        titulo="Facturas"
        descripcion={`${cantidad} · ${formatearMoneda(pagina.totalEmitido)} emitidos${hayFiltros ? " con estos filtros" : ""}`}
        acciones={<BotonNuevaVenta />}
      />
      <Card>
        <CardContent className="flex flex-col gap-4">
          <FiltrosFacturas clientes={clientes.data.map(({ id, nombre }) => ({ id, nombre }))} vendedores={vendedores} />
          {pagina.data.length === 0 ? (
            <EstadoVacio
              titulo={hayFiltros ? "No hay facturas que coincidan" : "Todavía no hay facturas"}
              descripcion={hayFiltros ? "Probá con otra búsqueda o cambiá los filtros." : "Registrá la primera con “Nueva venta”."}
              accion={hayFiltros ? undefined : <BotonNuevaVenta />}
            />
          ) : (
            <TablaFacturas facturas={pagina.data} />
          )}
          <Paginador ruta="/ventas" parametros={filtros} page={pagina.page} pageSize={pagina.pageSize} total={pagina.total} />
        </CardContent>
      </Card>
    </>
  );
}
