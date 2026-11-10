// Listado de ventas registradas (comprobantes).
import Link from "next/link";
import { BOTON_PRIMARIO, Encabezado } from "@/components/clientes/base";
import VentasHistorial from "@/components/ventas/VentasHistorial";

export default function VentasPage() {
  return (
    <>
      <Encabezado
        ruta="Ventas / Historial"
        titulo="Ventas registradas"
        subtitulo="Consultá los comprobantes del comercio."
        accion={
          <Link href="/ventas/nueva" className={BOTON_PRIMARIO}>
            + Nueva venta
          </Link>
        }
      />
      <VentasHistorial />
    </>
  );
}
