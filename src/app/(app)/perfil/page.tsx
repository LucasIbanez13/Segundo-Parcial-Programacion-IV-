// /perfil — cada usuario (admin o vendedor) ve sus datos y cambia su contraseña (RF-U5).
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Grilla } from "@/components/base/primitivas";
import { EncabezadoPagina } from "@/components/comunes/EncabezadoPagina";
import { DatosPerfil } from "@/components/auth/DatosPerfil";
import { FormularioCambiarPassword } from "@/components/auth/FormularioCambiarPassword";
import { getCurrentUser } from "@/lib/auth/sesion";

export const metadata: Metadata = { title: "Mi perfil" };

export default async function PaginaPerfil() {
  const usuario = await getCurrentUser();
  if (!usuario) redirect("/login");

  return (
    <>
      <EncabezadoPagina titulo="Mi perfil" descripcion="Tus datos de acceso y el cambio de contraseña." />
      <Grilla columnas={2} espacio={6} className="items-start">
        <DatosPerfil usuario={usuario} />
        <FormularioCambiarPassword />
      </Grilla>
    </>
  );
}
