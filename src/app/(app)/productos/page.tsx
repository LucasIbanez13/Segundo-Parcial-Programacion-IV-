// /productos — catálogo (RF-P1). Server Component que llama al servicio.
// Búsqueda, filtros y página viven en la URL (sección 10.6).
import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { EncabezadoPagina } from "@/components/comunes/EncabezadoPagina";
import { EstadoError } from "@/components/comunes/Estados";
import { Paginador } from "@/components/comunes/Paginador";
import { FiltrosProductos } from "@/components/productos/FiltrosProductos";
import { TablaProductos } from "@/components/productos/TablaProductos";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/sesion";
import { esAdmin } from "@/lib/auth/permisos";
import { ApiError } from "@/lib/errors";
import { listarCategorias } from "@/services/categorias.service";
import { listarProductos } from "@/services/productos.service";

export const metadata: Metadata = { title: "Productos" };

type Parametros = { q?: string; categoriaId?: string; bajoMinimo?: string; activo?: string; page?: string };

export default async function PaginaProductos({ searchParams }: { searchParams: Promise<Parametros> }) {
  const usuario = await getCurrentUser();
  if (!usuario) redirect("/login");
  const admin = esAdmin(usuario);
  const parametros = await searchParams;

  let pagina;
  let categorias;
  try {
    [pagina, categorias] = await Promise.all([
      listarProductos(usuario, parametros),
      listarCategorias(usuario, { activa: admin ? "todos" : "true" }),
    ]);
  } catch (error) {
    if (error instanceof ApiError) return <EstadoError mensaje={error.message} />;
    throw error;
  }

  const filtros = {
    q: parametros.q ?? "",
    categoriaId: parametros.categoriaId ?? "",
    bajoMinimo: parametros.bajoMinimo ?? "",
    activo: parametros.activo ?? "",
  };
  const hayFiltros = Boolean(filtros.q || filtros.categoriaId || filtros.bajoMinimo || filtros.activo);

  return (
    <>
      <EncabezadoPagina
        titulo="Productos"
        descripcion="Catálogo con precios y existencias."
        acciones={
          admin && (
            <Button asChild>
              <Link href="/productos/nuevo">
                <Plus /> Nuevo producto
              </Link>
            </Button>
          )
        }
      />
      <Card>
        <CardContent className="flex flex-col gap-4">
          <FiltrosProductos filtros={filtros} categorias={categorias} mostrarEstado={admin} />
          <TablaProductos
            productos={pagina.data}
            esAdmin={admin}
            mostrarEstado={admin && filtros.activo !== "" && filtros.activo !== "true"}
            hayFiltros={hayFiltros}
          />
          <Paginador
            ruta="/productos"
            parametros={{
              q: parametros.q,
              categoriaId: parametros.categoriaId,
              bajoMinimo: parametros.bajoMinimo,
              activo: parametros.activo,
            }}
            page={pagina.page}
            pageSize={pagina.pageSize}
            total={pagina.total}
          />
        </CardContent>
      </Card>
    </>
  );
}
