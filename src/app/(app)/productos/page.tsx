// /productos — módulo pendiente (RF-P1 a RF-P7). Se implementa en su hito (sección 12).
import type { Metadata } from "next";
import { EncabezadoPagina } from "@/components/comunes/EncabezadoPagina";
import { ModuloPendiente } from "@/components/comunes/ModuloPendiente";

export const metadata: Metadata = { title: "Productos" };

export default function Pagina() {
  return (
    <>
      <EncabezadoPagina titulo="Productos" descripcion="Catálogo, existencias y categorías." />
      <ModuloPendiente requerimientos="RF-P1 a RF-P7" />
    </>
  );
}
