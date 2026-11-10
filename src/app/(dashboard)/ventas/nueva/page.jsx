// Crear una venta: cliente, productos, resumen y forma de pago.
import Link from "next/link";
import { BOTON_SECUNDARIO, Encabezado } from "@/components/clientes/base";
import NuevaVentaForm from "@/components/ventas/NuevaVentaForm";

export default function NuevaVentaPage() {
  return (
    <>
      <Encabezado
        ruta="Ventas / Nueva venta"
        titulo="Crear una venta"
        subtitulo="Prepará el comprobante y registrá la operación."
        accion={
          <Link href="/ventas" className={BOTON_SECUNDARIO}>
            Ver ventas registradas →
          </Link>
        }
      />
      <NuevaVentaForm />
    </>
  );
}
