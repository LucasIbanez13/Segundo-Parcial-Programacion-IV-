// / — tablero de inicio (RF-T1 a RF-T3): indicadores, gráficos con Chart.js, más vendidos y productos para reponer.
// Server Component que llama a los servicios (sección 10.6). Ambos roles lo ven.
import { ArrowRight, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Pila } from "@/components/base/primitivas";
import { EncabezadoPagina } from "@/components/comunes/EncabezadoPagina";
import { EstadoError, EstadoVacio } from "@/components/comunes/Estados";
import { BotonReintentar } from "@/components/tablero/BotonReintentar";
import { GraficoFormasPago } from "@/components/tablero/GraficoFormasPago";
import { GraficoVentasDiarias } from "@/components/tablero/GraficoVentasDiarias";
import { ListaParaReponer } from "@/components/tablero/ListaParaReponer";
import { TablaMasVendidos } from "@/components/tablero/TablaMasVendidos";
import { TarjetasIndicadores } from "@/components/tablero/TarjetasIndicadores";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/sesion";
import { ApiError } from "@/lib/errors";
import type { Pagina } from "@/lib/schemas/comun";
import { listarProductos, type ProductoPublico } from "@/services/productos.service";
import { obtenerTablero, type Tablero } from "@/services/tablero.service";

export const metadata: Metadata = { title: "Inicio" };

const ZONA_ARGENTINA = "America/Argentina/Buenos_Aires";
const FECHA_LARGA = new Intl.DateTimeFormat("es-AR", { weekday: "long", day: "numeric", month: "long", timeZone: ZONA_ARGENTINA });
const MES_Y_ANIO = new Intl.DateTimeFormat("es-AR", { month: "long", year: "numeric", timeZone: ZONA_ARGENTINA });

function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export default async function PaginaInicio() {
  const usuario = await getCurrentUser();
  if (!usuario) redirect("/login");
  const ahora = new Date();

  const encabezado = (
    <EncabezadoPagina
      titulo={`Hola, ${usuario.nombre.split(" ")[0]}`}
      descripcion={capitalizar(FECHA_LARGA.format(ahora))}
      acciones={
        <Button asChild>
          <Link href="/ventas/nueva">
            <Plus /> Nueva venta
          </Link>
        </Button>
      }
    />
  );

  let tablero: Tablero;
  let paraReponer: Pagina<ProductoPublico>;
  try {
    [tablero, paraReponer] = await Promise.all([
      obtenerTablero(usuario, ahora),
      listarProductos(usuario, { bajoMinimo: "true", pageSize: "5" }),
    ]);
  } catch (error) {
    if (!(error instanceof ApiError)) console.error(error);
    return (
      <>
        {encabezado}
        <Pila espacio={3} className="items-center">
          <EstadoError
            mensaje={error instanceof ApiError ? error.message : "Ocurrió un error inesperado al cargar el tablero."}
          />
          <BotonReintentar />
        </Pila>
      </>
    );
  }

  const sinVentasEnElMes = tablero.mes.cantidad === 0;

  return (
    <>
      {encabezado}

      <TarjetasIndicadores tablero={tablero} ahora={ahora} />

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Ventas diarias</CardTitle>
            <CardDescription>Últimos 30 días</CardDescription>
          </CardHeader>
          <CardContent>
            <GraficoVentasDiarias dias={tablero.ventasDiarias} />
          </CardContent>
        </Card>
        <Card className="min-w-0 lg:col-span-2">
          <CardHeader>
            <CardTitle>Por forma de pago</CardTitle>
            <CardDescription>{capitalizar(MES_Y_ANIO.format(ahora))}</CardDescription>
          </CardHeader>
          <CardContent>
            {sinVentasEnElMes ? (
              <EstadoVacio titulo="Sin ventas este mes" descripcion="Cuando se emitan facturas vas a ver cómo se pagaron." />
            ) : (
              <GraficoFormasPago formas={tablero.porFormaDePago} />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Más vendidos del mes</CardTitle>
            <CardDescription>Por unidades</CardDescription>
          </CardHeader>
          <CardContent>
            <TablaMasVendidos productos={tablero.masVendidos} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Para reponer</CardTitle>
            <CardDescription>Productos bajo el stock mínimo</CardDescription>
            {paraReponer.total > 0 && (
              <CardAction>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/productos?bajoMinimo=true">
                    Ver todos <ArrowRight />
                  </Link>
                </Button>
              </CardAction>
            )}
          </CardHeader>
          <CardContent>
            <ListaParaReponer productos={paraReponer.data} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
