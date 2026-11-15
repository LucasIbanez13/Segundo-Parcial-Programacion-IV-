// /usuarios/[id] — edición de nombre, email, rol y estado (RF-U4).
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { EncabezadoPagina } from "@/components/comunes/EncabezadoPagina";
import { FormularioUsuario } from "@/components/usuarios/FormularioUsuario";
import { getCurrentUser } from "@/lib/auth/sesion";
import { ApiError } from "@/lib/errors";
import { idTexto } from "@/lib/schemas/comun";
import { obtenerUsuario } from "@/services/usuarios.service";

export const metadata: Metadata = { title: "Editar usuario" };

export default async function PaginaEditarUsuario({ params }: { params: Promise<{ id: string }> }) {
  const actor = await getCurrentUser();
  if (!actor) redirect("/login");

  const id = idTexto.safeParse((await params).id);
  if (!id.success) notFound();

  let usuario;
  try {
    usuario = await obtenerUsuario(actor, id.data);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  return (
    <>
      <EncabezadoPagina titulo={`Editar a ${usuario.nombre}`} descripcion={usuario.email} />
      <FormularioUsuario usuario={usuario} esElMismo={usuario.id === actor.id} />
    </>
  );
}
