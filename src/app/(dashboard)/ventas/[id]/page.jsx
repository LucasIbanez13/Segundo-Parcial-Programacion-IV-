// Detalle de un comprobante de venta.
import Link from "next/link";
import { BOTON_SECUNDARIO, Encabezado } from "@/components/clientes/base";
import DetalleVenta from "@/components/ventas/DetalleVenta";

const AVISOS = {
  "venta-registrada": "Venta registrada.",
};

export default async function DetalleVentaPage({ params, searchParams }) {
  const [{ id }, { aviso }] = await Promise.all([params, searchParams]);

  return (
    <>
      <Encabezado
        ruta="Ventas / Comprobante"
        titulo="Detalle de venta"
        subtitulo="Consultá los datos registrados en la operación."
        accion={
          <Link href="/ventas" className={BOTON_SECUNDARIO}>
            ← Volver a ventas
          </Link>
        }
      />
      <DetalleVenta id={id} avisoExito={AVISOS[aviso]} />
    </>
  );
}
