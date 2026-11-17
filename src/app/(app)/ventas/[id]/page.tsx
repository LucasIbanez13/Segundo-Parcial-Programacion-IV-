// /ventas/[id] — comprobante de la factura, imprimible (RF-V7). El administrador puede anularla (RF-V9).
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Fila, Pila, Titulo } from "@/components/base/primitivas";
import { BotonImprimir } from "@/components/clientes/BotonImprimir";
import { VolverA } from "@/components/clientes/VolverA";
import { ZonaImprimible } from "@/components/clientes/ZonaImprimible";
import { EstadoError } from "@/components/comunes/Estados";
import { Card, CardContent } from "@/components/ui/card";
import { AnularFactura } from "@/components/ventas/AnularFactura";
import { ComprobanteFactura } from "@/components/ventas/ComprobanteFactura";
import { InsigniaEstadoFactura } from "@/components/ventas/InsigniasFactura";
import { esAdmin } from "@/lib/auth/permisos";
import { getCurrentUser } from "@/lib/auth/sesion";
import { ApiError } from "@/lib/errors";
import { leerId } from "@/lib/http/parametros";
import { obtenerFactura, type FacturaPublica } from "@/services/facturas.service";

export const metadata: Metadata = { title: "Factura" };

export default async function PaginaFactura({ params }: { params: Promise<{ id: string }> }) {
  const usuario = await getCurrentUser();
  if (!usuario) redirect("/login");
  const { id } = await params;

  let factura: FacturaPublica;
  try {
    factura = await obtenerFactura(usuario, leerId(id, "La factura"));
  } catch (error) {
    if (error instanceof ApiError && error.code === "NO_ENCONTRADO") notFound();
    if (error instanceof ApiError) return <EstadoError mensaje={error.message} />;
    throw error;
  }

  return (
    <>
      <Pila espacio={3}>
        <VolverA href="/ventas">Facturas</VolverA>
        <Fila justificar="entre" alinear="centro" espacio={4} envolver>
          <Fila espacio={3} envolver>
            <Titulo>Factura {factura.numeroFormateado}</Titulo>
            <InsigniaEstadoFactura estado={factura.estado} />
          </Fila>
          <Fila espacio={2} envolver>
            {esAdmin(usuario) && factura.estado === "emitida" && <AnularFactura factura={factura} />}
            <BotonImprimir />
          </Fila>
        </Fila>
      </Pila>
      <ZonaImprimible className="mx-auto w-full max-w-3xl">
        <Card className="print:border-0 print:shadow-none">
          <CardContent className="p-6 sm:p-10">
            <ComprobanteFactura factura={factura} />
          </CardContent>
        </Card>
      </ZonaImprimible>
    </>
  );
}
