// /ventas — módulo pendiente (RF-V1 a RF-V9). Se implementa en su hito (sección 12).
import type { Metadata } from "next";
import { EncabezadoPagina } from "@/components/comunes/EncabezadoPagina";
import { ModuloPendiente } from "@/components/comunes/ModuloPendiente";

export const metadata: Metadata = { title: "Ventas" };

export default function Pagina() {
  return (
    <>
      <EncabezadoPagina titulo="Ventas" descripcion="Nueva venta, facturas y comprobantes." />
      <ModuloPendiente requerimientos="RF-V1 a RF-V9" />
    </>
  );
}
