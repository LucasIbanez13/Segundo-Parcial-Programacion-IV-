// Listado de clientes de /clientes (RF-C1). Server Component: llama al servicio con los parámetros de la URL
// (sección 10.6). Arriba muestra cuánto se adeuda en total en cuentas corrientes.
import { Wallet } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { EncabezadoPagina } from "@/components/comunes/EncabezadoPagina";
import { EstadoError, EstadoVacio } from "@/components/comunes/Estados";
import { Paginador } from "@/components/comunes/Paginador";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/sesion";
import { ApiError } from "@/lib/errors";
import { formatearMoneda } from "@/lib/format";
import { listarClientes, type PaginaClientes } from "@/services/clientes.service";
import { BotonNuevoCliente } from "./BotonNuevoCliente";
import { FiltrosClientes } from "./FiltrosClientes";
import { TablaClientes } from "./TablaClientes";

export type ParametrosClientes = { q?: string; activo?: string; conDeuda?: string; page?: string };

export async function ListadoClientes({ parametros }: { parametros: ParametrosClientes }) {
  const usuario = await getCurrentUser();
  if (!usuario) redirect("/login");

  let pagina: PaginaClientes;
  let deudores: PaginaClientes;
  try {
    // La segunda consulta trae solo el total adeudado de todos los clientes, sin importar los filtros.
    [pagina, deudores] = await Promise.all([
      listarClientes(usuario, parametros),
      listarClientes(usuario, { conDeuda: "true", pageSize: "1" }),
    ]);
  } catch (error) {
    if (error instanceof ApiError) return <EstadoError mensaje={error.message} />;
    throw error;
  }

  const conDeuda = parametros.conDeuda === "true";
  const hayFiltros = Boolean(parametros.q || conDeuda || (parametros.activo && parametros.activo !== "true"));

  return (
    <>
      <EncabezadoPagina
        titulo="Clientes"
        descripcion={`${formatearMoneda(deudores.totalAdeudado ?? 0)} adeudados en cuentas corrientes`}
        acciones={
          <>
            <Button variant="outline" asChild>
              <Link href="/clientes/saldos">
                <Wallet /> Saldos
              </Link>
            </Button>
            <BotonNuevoCliente />
          </>
        }
      />
      <Card>
        <CardContent className="flex flex-col gap-4">
          <FiltrosClientes q={parametros.q ?? ""} activo={parametros.activo ?? ""} conDeuda={conDeuda} />
          {pagina.data.length === 0 ? (
            <EstadoVacio
              titulo={hayFiltros ? "No hay clientes que coincidan" : "Todavía no hay clientes"}
              descripcion={hayFiltros ? "Probá con otra búsqueda o cambiá los filtros." : "Agregá el primero con “Nuevo cliente”."}
              accion={hayFiltros ? undefined : <BotonNuevoCliente />}
            />
          ) : (
            <TablaClientes clientes={pagina.data} />
          )}
          <Paginador
            ruta="/clientes"
            parametros={{ q: parametros.q, activo: parametros.activo, conDeuda: parametros.conDeuda }}
            page={pagina.page}
            pageSize={pagina.pageSize}
            total={pagina.total}
          />
        </CardContent>
      </Card>
    </>
  );
}
