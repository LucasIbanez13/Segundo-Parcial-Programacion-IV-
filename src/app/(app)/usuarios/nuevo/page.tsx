// /usuarios/nuevo — alta de usuario con rol y contraseña temporal (RF-U4).
import type { Metadata } from "next";
import { EncabezadoPagina } from "@/components/comunes/EncabezadoPagina";
import { FormularioUsuario } from "@/components/usuarios/FormularioUsuario";

export const metadata: Metadata = { title: "Nuevo usuario" };

export default function PaginaNuevoUsuario() {
  return (
    <>
      <EncabezadoPagina titulo="Nuevo usuario" descripcion="Dale acceso al sistema a una persona del comercio." />
      <FormularioUsuario />
    </>
  );
}
