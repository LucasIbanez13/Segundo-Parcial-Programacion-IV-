// / — módulo pendiente (RF-T1 a RF-T3). Se implementa en su hito (sección 12).
import type { Metadata } from "next";
import { EncabezadoPagina } from "@/components/comunes/EncabezadoPagina";
import { ModuloPendiente } from "@/components/comunes/ModuloPendiente";

export const metadata: Metadata = { title: "Inicio" };

export default function Pagina() {
  return (
    <>
      <EncabezadoPagina titulo="Inicio" descripcion="Indicadores y gráficos del comercio." />
      <ModuloPendiente requerimientos="RF-T1 a RF-T3" />
    </>
  );
}
