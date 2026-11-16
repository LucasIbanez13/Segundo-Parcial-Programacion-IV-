// /productos/movimientos — movimientos de stock de todos los productos (RF-P6), con filtros por tipo y fechas.
// Ambos roles. Filtros y página viven en la URL (sección 10.6).
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { EncabezadoPagina } from "@/components/comunes/EncabezadoPagina";
import { EstadoError } from "@/components/comunes/Estados";
import { Paginador } from "@/components/comunes/Paginador";
import { FiltrosMovimientos } from "@/components/productos/FiltrosMovimientos";
import { TablaMovimientos } from "@/components/productos/TablaMovimientos";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/sesion";
import { ApiError } from "@/lib/errors";
import { listarMovimientos } from "@/services/stock.service";

export const metadata: Metadata = { title: "Movimientos de stock" };

type Parametros = { tipo?: string; desde?: string; hasta?: string; productoId?: string; page?: string };

export default async function PaginaMovimientos({ searchParams }: { searchParams: Promise<Parametros> }) {
  const usuario = await getCurrentUser();
  if (!usuario) redirect("/login");
  const parametros = await searchParams;

  let pagina;
  try {
    pagina = await listarMovimientos(usuario, parametros);
  } catch (error) {
    if (error instanceof ApiError) {
      // Un filtro inválido en la URL (por ejemplo, una fecha mal escrita) se explica con el detalle del campo.
      const detalle = Array.isArray(error.details) ? (error.details[0] as { mensaje?: string })?.mensaje : undefined;
      return <EstadoError mensaje={detalle ?? error.message} />;
    }
    throw error;
  }

  const filtros = {
    tipo: parametros.tipo ?? "",
    desde: parametros.desde ?? "",
    hasta: parametros.hasta ?? "",
    productoId: parametros.productoId ?? "",
  };
  const hayFiltros = Object.values(filtros).some(Boolean);

  return (
    <>
      <EncabezadoPagina
        titulo="Movimientos de stock"
        descripcion="Ventas, anulaciones, ingresos y egresos de todos los productos, del más nuevo al más viejo."
      />
      <Card>
        <CardContent className="flex flex-col gap-4">
          <FiltrosMovimientos filtros={filtros} />
          <TablaMovimientos
            movimientos={pagina.data}
            mostrarProducto
            textoVacio={
              hayFiltros
                ? { titulo: "No hay movimientos que coincidan", descripcion: "Probá con otro tipo o rango de fechas." }
                : { titulo: "Todavía no hay movimientos de stock" }
            }
          />
          <Paginador
            ruta="/productos/movimientos"
            parametros={filtros}
            page={pagina.page}
            pageSize={pagina.pageSize}
            total={pagina.total}
          />
        </CardContent>
      </Card>
    </>
  );
}
