// /ventas/nueva — Nueva venta (RF-V1 a RF-V6). El número que se muestra es solo informativo:
// el real se asigna al confirmar (regla 4).
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { EncabezadoPagina } from "@/components/comunes/EncabezadoPagina";
import { NuevaVenta } from "@/components/ventas/NuevaVenta";
import { getCurrentUser } from "@/lib/auth/sesion";
import { proximoNumero } from "@/services/facturas.service";

export const metadata: Metadata = { title: "Nueva venta" };

export default async function PaginaNuevaVenta() {
  const usuario = await getCurrentUser();
  if (!usuario) redirect("/login");
  const { numeroFormateado } = await proximoNumero(usuario);

  return (
    <>
      <EncabezadoPagina
        titulo="Nueva venta"
        descripcion="El número se asigna al confirmar. Operable con teclado: F2 producto, F4 cliente, F8 pago, F9 confirmar."
      />
      <NuevaVenta vendedor={usuario.nombre} proximoNumero={numeroFormateado} />
    </>
  );
}
