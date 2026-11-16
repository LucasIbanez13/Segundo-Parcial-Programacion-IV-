// /productos/[id]/editar — edición de producto (RF-P2). Solo admin: además de este aviso, productos.service responde 403.
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { EncabezadoPagina } from "@/components/comunes/EncabezadoPagina";
import { EstadoError } from "@/components/comunes/Estados";
import { FormularioProducto } from "@/components/productos/FormularioProducto";
import { getCurrentUser } from "@/lib/auth/sesion";
import { esAdmin } from "@/lib/auth/permisos";
import { ApiError } from "@/lib/errors";
import { idTexto } from "@/lib/schemas/comun";
import { listarCategorias } from "@/services/categorias.service";
import { obtenerProducto } from "@/services/productos.service";

export const metadata: Metadata = { title: "Editar producto" };

export default async function PaginaEditarProducto({ params }: { params: Promise<{ id: string }> }) {
  const usuario = await getCurrentUser();
  if (!usuario) redirect("/login");
  if (!esAdmin(usuario)) return <EstadoError mensaje="La edición de productos está reservada al administrador." />;

  const id = idTexto.safeParse((await params).id);
  if (!id.success) notFound();

  let producto;
  try {
    producto = await obtenerProducto(usuario, id.data);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  // Activas para elegir, más la actual aunque esté inactiva (para no perderla al guardar otros cambios).
  const todas = await listarCategorias(usuario, { activa: "todos" });
  const categorias = todas.filter((categoria) => categoria.activa || categoria.id === producto.categoria.id);

  return (
    <>
      <EncabezadoPagina titulo={`Editar ${producto.codigo}`} descripcion={producto.descripcion} />
      <FormularioProducto producto={producto} categorias={categorias} />
    </>
  );
}
