// /productos/nuevo — alta de producto (RF-P2). Solo admin: además de este aviso, productos.service responde 403.
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { EncabezadoPagina } from "@/components/comunes/EncabezadoPagina";
import { EstadoError, EstadoVacio } from "@/components/comunes/Estados";
import { FormularioProducto } from "@/components/productos/FormularioProducto";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/sesion";
import { esAdmin } from "@/lib/auth/permisos";
import { listarCategorias } from "@/services/categorias.service";

export const metadata: Metadata = { title: "Nuevo producto" };

export default async function PaginaNuevoProducto() {
  const usuario = await getCurrentUser();
  if (!usuario) redirect("/login");
  if (!esAdmin(usuario)) return <EstadoError mensaje="El alta de productos está reservada al administrador." />;

  const categorias = await listarCategorias(usuario, {});

  return (
    <>
      <EncabezadoPagina titulo="Nuevo producto" descripcion="Sumá un artículo al catálogo." />
      {categorias.length === 0 ? (
        <EstadoVacio
          titulo="Primero creá una categoría"
          descripcion="Cada producto pertenece a una categoría activa."
          accion={
            <Button asChild>
              <Link href="/productos/categorias">Ir a categorías</Link>
            </Button>
          }
        />
      ) : (
        <FormularioProducto categorias={categorias} />
      )}
    </>
  );
}
