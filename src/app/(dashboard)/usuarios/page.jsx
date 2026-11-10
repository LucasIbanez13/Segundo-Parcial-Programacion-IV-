// Listado de usuarios (solo administrador; lo verifica usuarios/layout.jsx).
import Link from "next/link";
import PageHeader from "@/components/layout/PageHeader";
import AvisoExito from "@/components/usuarios/AvisoExito";
import { AVISO_ERROR, BOTON_PRIMARIO, PANEL } from "@/components/usuarios/estilos";
import UsuariosTable from "@/components/usuarios/UsuariosTable";
import { listarUsuarios } from "@/services/usuarios.service";

export const metadata = { title: "Usuarios · mostrador" };

const AVISOS = {
  "usuario-creado": "Usuario creado.",
  "usuario-actualizado": "Cambios guardados.",
};

// Carga inicial desde el Server Component (permitido: llama al service, nunca a un repository).
async function cargarUsuarios() {
  try {
    return await listarUsuarios();
  } catch (error) {
    console.error("No se pudieron cargar los usuarios:", error);
    return null;
  }
}

export default async function UsuariosPage({ searchParams }) {
  const [{ aviso }, usuarios] = await Promise.all([searchParams, cargarUsuarios()]);

  return (
    <>
      <PageHeader
        ruta="Configuración / Accesos"
        titulo="Usuarios"
        subtitulo="Administrá las personas que pueden ingresar al sistema."
        accion={
          <Link href="/usuarios/nuevo" className={BOTON_PRIMARIO}>
            + Nuevo usuario
          </Link>
        }
      />
      <div className="grid grid-cols-1 gap-[18px]">
        <AvisoExito mensaje={AVISOS[aviso]} />
        {usuarios ? (
          <div className={`${PANEL} overflow-x-auto`}>
            <UsuariosTable usuarios={usuarios} />
          </div>
        ) : (
          <div role="alert" className={AVISO_ERROR}>
            No pudimos cargar los usuarios. Recargá la página para intentar de nuevo.
          </div>
        )}
      </div>
    </>
  );
}
