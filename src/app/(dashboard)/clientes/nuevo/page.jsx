// Alta de cliente.
import Link from "next/link";
import { BOTON_SECUNDARIO, Encabezado } from "@/components/clientes/base";
import ClienteForm from "@/components/clientes/ClienteForm";

export default function NuevoClientePage() {
  return (
    <>
      <Encabezado
        ruta="Clientes / Alta"
        titulo="Nuevo cliente"
        subtitulo="Registrá sus datos para futuras ventas y pagos."
        accion={
          <Link href="/clientes" className={BOTON_SECUNDARIO}>
            ← Volver
          </Link>
        }
      />
      <ClienteForm />
    </>
  );
}
