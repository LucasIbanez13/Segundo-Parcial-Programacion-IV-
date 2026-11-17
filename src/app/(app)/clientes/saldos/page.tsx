// /clientes/saldos — clientes con deuda, de mayor a menor, con el total adeudado (RF-C6). Imprimible.
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Pila } from "@/components/base/primitivas";
import { BotonImprimir } from "@/components/clientes/BotonImprimir";
import { TablaSaldos } from "@/components/clientes/TablaSaldos";
import { VolverA } from "@/components/clientes/VolverA";
import { ZonaImprimible } from "@/components/clientes/ZonaImprimible";
import { EncabezadoPagina } from "@/components/comunes/EncabezadoPagina";
import { EstadoError, EstadoVacio } from "@/components/comunes/Estados";
import { Paginador } from "@/components/comunes/Paginador";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/sesion";
import { ApiError } from "@/lib/errors";
import { formatearMoneda } from "@/lib/format";
import { listarClientes, type PaginaClientes } from "@/services/clientes.service";

export const metadata: Metadata = { title: "Saldos de clientes" };

export default async function PaginaSaldos({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const usuario = await getCurrentUser();
  if (!usuario) redirect("/login");
  const { page } = await searchParams;

  // Con conDeuda el servicio trae solo saldo > 0, de mayor a menor, y el total adeudado.
  let pagina: PaginaClientes;
  try {
    pagina = await listarClientes(usuario, { conDeuda: "true", page });
  } catch (error) {
    if (error instanceof ApiError) return <EstadoError mensaje={error.message} />;
    throw error;
  }

  const total = pagina.totalAdeudado ?? 0;
  const resumen =
    pagina.total === 0
      ? "Ningún cliente tiene deuda"
      : `${pagina.total} ${pagina.total === 1 ? "cliente adeuda" : "clientes adeudan"} ${formatearMoneda(total)}`;

  return (
    <ZonaImprimible className="flex flex-col gap-6">
      <Pila espacio={3}>
        <VolverA href="/clientes">Clientes</VolverA>
        <EncabezadoPagina
          titulo="Saldos de cuentas corrientes"
          descripcion={resumen}
          acciones={pagina.total > 0 ? <BotonImprimir variant="outline" /> : undefined}
        />
      </Pila>
      <Card>
        <CardContent className="flex flex-col gap-4">
          {pagina.data.length === 0 ? (
            <EstadoVacio titulo="Ningún cliente tiene deuda" descripcion="Las ventas en cuenta corriente aparecen acá hasta que se pagan." />
          ) : (
            <TablaSaldos clientes={pagina.data} desde={(pagina.page - 1) * pagina.pageSize} total={total} />
          )}
          <div className="print:hidden">
            <Paginador ruta="/clientes/saldos" parametros={{}} page={pagina.page} pageSize={pagina.pageSize} total={pagina.total} />
          </div>
        </CardContent>
      </Card>
    </ZonaImprimible>
  );
}
