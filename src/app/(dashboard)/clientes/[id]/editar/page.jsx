// Edición de cliente.
import Link from "next/link";
import { BOTON_SECUNDARIO, Encabezado } from "@/components/clientes/base";
import EditarCliente from "@/components/clientes/EditarCliente";

export default async function EditarClientePage({ params }) {
  const { id } = await params;

  return (
    <>
      <Encabezado
        ruta="Clientes / Edición"
        titulo="Editar cliente"
        subtitulo="Actualizá sus datos de identificación y contacto."
        accion={
          <Link href="/clientes" className={BOTON_SECUNDARIO}>
            ← Volver
          </Link>
        }
      />
      <EditarCliente id={id} />
    </>
  );
}
