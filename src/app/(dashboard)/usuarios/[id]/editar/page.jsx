// Edición / activación de usuario (solo administrador; lo verifica usuarios/layout.jsx).
import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import { BOTON_SECUNDARIO } from "@/components/usuarios/estilos";
import UsuarioForm from "@/components/usuarios/UsuarioForm";
import { idTexto } from "@/lib/validations/comun";
import { obtenerUsuario } from "@/services/usuarios.service";

export const metadata = { title: "Editar usuario · mostrador" };

// Carga inicial desde el Server Component: llama al service, nunca a un repository.
async function cargarUsuario(idDeRuta) {
  const id = idTexto.safeParse(idDeRuta);
  if (!id.success) notFound();
  try {
    return await obtenerUsuario(id.data);
  } catch (error) {
    if (error.status === 404) notFound();
    throw error;
  }
}

export default async function EditarUsuarioPage({ params }) {
  const { id } = await params;
  const usuario = await cargarUsuario(id);

  return (
    <>
      <PageHeader
        ruta="Usuarios / Edición"
        titulo="Editar usuario"
        subtitulo="Actualizá los datos y el estado de acceso."
        accion={
          <Link href="/usuarios" className={BOTON_SECUNDARIO}>
            ← Volver a usuarios
          </Link>
        }
      />
      <UsuarioForm usuario={usuario} />
    </>
  );
}
