// /productos/[id] — ficha del producto con sus movimientos (RF-P6). Ambos roles consultan;
// el administrador además edita, registra ingresos y egresos (RF-P4, RF-P5) y da de baja (RF-P3).
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Grilla, Pila, Texto, Titulo } from "@/components/base/primitivas";
import { EncabezadoPagina } from "@/components/comunes/EncabezadoPagina";
import { InsigniaActivo } from "@/components/comunes/InsigniaEstado";
import { Paginador } from "@/components/comunes/Paginador";
import { AccionesProducto } from "@/components/productos/AccionesProducto";
import { InsigniaBajoMinimo } from "@/components/productos/InsigniasProducto";
import { TablaMovimientos } from "@/components/productos/TablaMovimientos";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/sesion";
import { esAdmin } from "@/lib/auth/permisos";
import { ApiError } from "@/lib/errors";
import { formatearMoneda } from "@/lib/format";
import { idTexto } from "@/lib/schemas/comun";
import { obtenerProducto } from "@/services/productos.service";
import { listarMovimientosProducto } from "@/services/stock.service";

export const metadata: Metadata = { title: "Ficha del producto" };

function Dato({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <Pila espacio={1}>
      <Texto variante="chico">{etiqueta}</Texto>
      {children}
    </Pila>
  );
}

export default async function PaginaProducto({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const usuario = await getCurrentUser();
  if (!usuario) redirect("/login");

  const id = idTexto.safeParse((await params).id);
  if (!id.success) notFound();
  const { page } = await searchParams;

  let producto;
  let movimientos;
  try {
    [producto, movimientos] = await Promise.all([
      obtenerProducto(usuario, id.data),
      listarMovimientosProducto(usuario, id.data, { page }),
    ]);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  return (
    <>
      <EncabezadoPagina
        titulo={producto.descripcion}
        descripcion={`Código ${producto.codigo} · ${producto.categoria.nombre}`}
        acciones={esAdmin(usuario) && <AccionesProducto producto={producto} />}
      />

      <Grilla columnas={4} className="grid-cols-2">
        {/* Dos columnas también en el teléfono: son datos cortos. */}
        <Card>
          <CardContent>
            <Dato etiqueta="Existencia">
              <Titulo nivel={2} className="tabular-nums">
                {producto.existencia}
              </Titulo>
              {producto.bajoMinimo && <InsigniaBajoMinimo />}
            </Dato>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Dato etiqueta="Stock mínimo">
              <Titulo nivel={2} className="tabular-nums">
                {producto.stockMinimo}
              </Titulo>
            </Dato>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Dato etiqueta="Precio de venta">
              <Titulo nivel={2} className="tabular-nums">
                {formatearMoneda(producto.precio)}
              </Titulo>
            </Dato>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Dato etiqueta="Estado">
              <InsigniaActivo activo={producto.activo} />
              {!producto.activo && <Texto variante="chico">No se ofrece en ventas.</Texto>}
            </Dato>
          </CardContent>
        </Card>
      </Grilla>

      <Card>
        <CardHeader>
          <CardTitle>Movimientos de stock</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <TablaMovimientos
            movimientos={movimientos.data}
            textoVacio={{
              titulo: "Todavía no tiene movimientos",
              descripcion: "La existencia cambia con ingresos, egresos, ventas y anulaciones.",
            }}
          />
          <Paginador
            ruta={`/productos/${producto.id}`}
            parametros={{}}
            page={movimientos.page}
            pageSize={movimientos.pageSize}
            total={movimientos.total}
          />
        </CardContent>
      </Card>
    </>
  );
}
