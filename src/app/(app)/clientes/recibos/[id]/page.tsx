// /clientes/recibos/[id] — recibo de un pago, numerado e imprimible (RF-C5). Se abre al registrar el pago
// y desde la cuenta corriente para reimprimirlo.
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Pila } from "@/components/base/primitivas";
import { BotonImprimir } from "@/components/clientes/BotonImprimir";
import { ReciboImprimible } from "@/components/clientes/ReciboImprimible";
import { VolverA } from "@/components/clientes/VolverA";
import { ZonaImprimible } from "@/components/clientes/ZonaImprimible";
import { EncabezadoPagina } from "@/components/comunes/EncabezadoPagina";
import { EstadoError } from "@/components/comunes/Estados";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/sesion";
import { ApiError } from "@/lib/errors";
import { leerId } from "@/lib/http/parametros";
import { obtenerRecibo, type Recibo } from "@/services/pagos.service";

export const metadata: Metadata = { title: "Recibo" };

export default async function PaginaRecibo({ params }: { params: Promise<{ id: string }> }) {
  const usuario = await getCurrentUser();
  if (!usuario) redirect("/login");
  const { id } = await params;

  let recibo: Recibo;
  try {
    recibo = await obtenerRecibo(usuario, leerId(id, "El pago"));
  } catch (error) {
    if (error instanceof ApiError && error.code === "NO_ENCONTRADO") notFound();
    if (error instanceof ApiError) return <EstadoError mensaje={error.message} />;
    throw error;
  }

  return (
    <>
      <Pila espacio={3}>
        <VolverA href={`/clientes/${recibo.cliente.id}`}>{recibo.cliente.nombre}</VolverA>
        <EncabezadoPagina titulo={`Recibo ${recibo.numeroRecibo}`} acciones={<BotonImprimir />} />
      </Pila>
      <ZonaImprimible className="mx-auto w-full max-w-3xl">
        <Card className="print:border-0 print:shadow-none">
          <CardContent className="p-6 sm:p-10">
            <ReciboImprimible recibo={recibo} />
          </CardContent>
        </Card>
      </ZonaImprimible>
    </>
  );
}
