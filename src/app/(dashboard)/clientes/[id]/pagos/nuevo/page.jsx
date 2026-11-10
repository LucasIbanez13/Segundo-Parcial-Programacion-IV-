// Registrar un pago (fecha, importe, observación opcional).
import Link from "next/link";
import { BOTON_SECUNDARIO, Encabezado } from "@/components/clientes/base";
import NuevoPago from "@/components/clientes/NuevoPago";

export default async function NuevoPagoPage({ params }) {
  const { id } = await params;

  return (
    <>
      <Encabezado
        ruta="Clientes / Cuenta corriente / Pago"
        titulo="Registrar pago"
        subtitulo="Ingresá el importe recibido a cuenta del saldo."
        accion={
          <Link href={`/clientes/${id}`} className={BOTON_SECUNDARIO}>
            ← Volver a la cuenta
          </Link>
        }
      />
      <NuevoPago id={id} />
    </>
  );
}
