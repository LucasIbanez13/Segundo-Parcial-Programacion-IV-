// Listado de clientes con búsqueda y saldo adeudado.
import Link from "next/link";
import { BOTON_PRIMARIO, Encabezado } from "@/components/clientes/base";
import ClientesListado from "@/components/clientes/ClientesListado";

const AVISOS = {
  "cliente-creado": "Cliente guardado.",
  "cliente-actualizado": "Cambios guardados.",
};

export default async function ClientesPage({ searchParams }) {
  const { aviso } = await searchParams;

  return (
    <>
      <Encabezado
        ruta="Personas / Cuentas corrientes"
        titulo="Clientes"
        subtitulo="Consultá sus datos y el estado de sus cuentas."
        accion={
          <Link href="/clientes/nuevo" className={BOTON_PRIMARIO}>
            + Nuevo cliente
          </Link>
        }
      />
      <ClientesListado avisoExito={AVISOS[aviso]} />
    </>
  );
}
