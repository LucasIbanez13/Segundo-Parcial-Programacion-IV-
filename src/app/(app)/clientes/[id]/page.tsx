// /clientes/[id] — ficha del cliente (RF-C3): saldo, límite y disponible; datos y últimas facturas;
// cuenta corriente con saldo acumulado (RF-C4). Server Component que llama a los servicios.
// El rango de fechas de la cuenta vive en la URL; si viene, la ficha abre en esa pestaña.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Fila, Grilla, Pila, Texto, Titulo } from "@/components/base/primitivas";
import { AccionesFicha } from "@/components/clientes/AccionesFicha";
import { FiltroFechasCuenta } from "@/components/clientes/FiltroFechasCuenta";
import { InsigniaCuentaCorriente } from "@/components/clientes/InsigniasCliente";
import { TablaCuentaCorriente } from "@/components/clientes/TablaCuentaCorriente";
import { TablaUltimasFacturas } from "@/components/clientes/TablaUltimasFacturas";
import { VolverA } from "@/components/clientes/VolverA";
import { EstadoError } from "@/components/comunes/Estados";
import { InsigniaActivo } from "@/components/comunes/InsigniaEstado";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCurrentUser } from "@/lib/auth/sesion";
import { ApiError } from "@/lib/errors";
import { formatearMoneda } from "@/lib/format";
import { leerId } from "@/lib/http/parametros";
import { cn } from "@/lib/utils";
import { obtenerCliente, obtenerCuentaCorriente, type ClienteDetalle, type CuentaCorriente } from "@/services/clientes.service";

export const metadata: Metadata = { title: "Ficha del cliente" };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ desde?: string; hasta?: string }> };

function Importe({ etiqueta, centavos, deuda = false }: { etiqueta: string; centavos: number | null; deuda?: boolean }) {
  return (
    <Card>
      <CardContent>
        <Pila espacio={1}>
          <Texto variante="suave">{etiqueta}</Texto>
          <Texto className={cn("text-3xl font-semibold tracking-tight tabular-nums", deuda && "text-destructive")}>
            {centavos === null ? "Sin límite" : formatearMoneda(centavos)}
          </Texto>
        </Pila>
      </CardContent>
    </Card>
  );
}

function Dato({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <Fila justificar="entre" alinear="inicio" espacio={4}>
      <Texto variante="suave">{etiqueta}</Texto>
      <Texto className="text-right break-all">{children}</Texto>
    </Fila>
  );
}

export default async function PaginaFichaCliente({ params, searchParams }: Props) {
  const usuario = await getCurrentUser();
  if (!usuario) redirect("/login");
  const [{ id: idTexto }, filtros] = await Promise.all([params, searchParams]);

  let cliente: ClienteDetalle;
  try {
    cliente = await obtenerCliente(usuario, leerId(idTexto, "El cliente"));
  } catch (error) {
    if (error instanceof ApiError && error.code === "NO_ENCONTRADO") notFound();
    if (error instanceof ApiError) return <EstadoError mensaje={error.message} />;
    throw error;
  }

  // Un rango de fechas inválido en la URL se muestra como error en la pestaña, sin romper la ficha.
  let cuenta: CuentaCorriente | null = null;
  let errorCuenta: string | null = null;
  try {
    cuenta = await obtenerCuentaCorriente(usuario, cliente.id, { desde: filtros.desde, hasta: filtros.hasta });
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    errorCuenta = error.message;
  }

  const conFiltroFechas = Boolean(filtros.desde || filtros.hasta);

  return (
    <>
      <Pila espacio={3}>
        <VolverA href="/clientes">Clientes</VolverA>
        <Fila justificar="entre" alinear="fin" espacio={4} envolver>
          <Pila espacio={1}>
            <Fila espacio={2} envolver>
              <Titulo>{cliente.nombre}</Titulo>
              <InsigniaCuentaCorriente habilitada={cliente.cuentaCorriente} />
              {!cliente.activo && <InsigniaActivo activo={false} />}
            </Fila>
            <Texto variante="suave">
              {cliente.tipoDoc} {cliente.nroDoc}
            </Texto>
          </Pila>
          <Fila espacio={2} envolver>
            <AccionesFicha cliente={cliente} />
          </Fila>
        </Fila>
      </Pila>

      <Grilla columnas={3}>
        <Importe etiqueta="Saldo actual" centavos={cliente.saldo} deuda={cliente.saldo > 0} />
        <Importe etiqueta="Límite de crédito" centavos={cliente.limiteCredito} />
        <Importe etiqueta="Disponible" centavos={cliente.disponible} />
      </Grilla>

      <Tabs defaultValue={conFiltroFechas ? "cuenta" : "datos"} className="gap-4">
        <TabsList className="w-full sm:w-fit">
          <TabsTrigger value="datos">Datos y facturas</TabsTrigger>
          <TabsTrigger value="cuenta">Cuenta corriente</TabsTrigger>
        </TabsList>

        <TabsContent value="datos">
          <div className="grid items-start gap-4 lg:grid-cols-[2fr_3fr]">
            <Card>
              <CardContent>
                <Pila espacio={3}>
                  <Dato etiqueta="Documento">
                    {cliente.tipoDoc} {cliente.nroDoc}
                  </Dato>
                  <Dato etiqueta="Domicilio">{cliente.domicilio ?? "—"}</Dato>
                  <Dato etiqueta="Teléfono">{cliente.telefono ?? "—"}</Dato>
                  <Dato etiqueta="Email">{cliente.email ?? "—"}</Dato>
                  <Dato etiqueta="Cuenta corriente">{cliente.cuentaCorriente ? "Habilitada" : "No habilitada"}</Dato>
                </Pila>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Últimas facturas</CardTitle>
                <CardAction>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/ventas?clienteId=${cliente.id}`}>Ver todas</Link>
                  </Button>
                </CardAction>
              </CardHeader>
              <CardContent>
                <TablaUltimasFacturas facturas={cliente.ultimasFacturas} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cuenta">
          <Card>
            <CardContent className="flex flex-col gap-4">
              <FiltroFechasCuenta desde={filtros.desde ?? ""} hasta={filtros.hasta ?? ""} />
              {errorCuenta || !cuenta ? (
                <EstadoError mensaje={errorCuenta ?? "No pudimos cargar la cuenta corriente."} />
              ) : (
                <TablaCuentaCorriente cuenta={cuenta} conDesde={Boolean(filtros.desde)} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
