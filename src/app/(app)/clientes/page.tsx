// /clientes — módulo pendiente (RF-C1 a RF-C7). Se implementa en su hito (sección 12).
import type { Metadata } from "next";
import { EncabezadoPagina } from "@/components/comunes/EncabezadoPagina";
import { ModuloPendiente } from "@/components/comunes/ModuloPendiente";

export const metadata: Metadata = { title: "Clientes" };

export default function Pagina() {
  return (
    <>
      <EncabezadoPagina titulo="Clientes" descripcion="Clientes, cuentas corrientes y pagos." />
      <ModuloPendiente requerimientos="RF-C1 a RF-C7" />
    </>
  );
}
