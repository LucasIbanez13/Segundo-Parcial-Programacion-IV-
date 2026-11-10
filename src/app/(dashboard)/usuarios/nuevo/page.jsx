// Alta de usuario (solo administrador; lo verifica usuarios/layout.jsx).
import Link from "next/link";
import PageHeader from "@/components/layout/PageHeader";
import { BOTON_SECUNDARIO } from "@/components/usuarios/estilos";
import UsuarioForm from "@/components/usuarios/UsuarioForm";

export const metadata = { title: "Nuevo usuario · mostrador" };

export default function NuevoUsuarioPage() {
  return (
    <>
      <PageHeader
        ruta="Usuarios / Alta"
        titulo="Nuevo usuario"
        subtitulo="Creá un acceso para una persona que trabaja en el comercio."
        accion={
          <Link href="/usuarios" className={BOTON_SECUNDARIO}>
            ← Volver a usuarios
          </Link>
        }
      />
      <UsuarioForm />
    </>
  );
}
