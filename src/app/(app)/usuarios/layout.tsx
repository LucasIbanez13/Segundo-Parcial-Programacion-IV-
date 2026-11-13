// Módulo Usuarios: solo administrador (sección 3). Además de este aviso, cada servicio verifica el rol
// y la API responde 403 SIN_PERMISO a un vendedor aunque la llame directamente.
import { EstadoError } from "@/components/comunes/Estados";
import { getCurrentUser } from "@/lib/auth/sesion";
import { esAdmin } from "@/lib/auth/permisos";

export default async function LayoutUsuarios({ children }: { children: React.ReactNode }) {
  const usuario = await getCurrentUser();
  if (!esAdmin(usuario)) {
    return <EstadoError mensaje="La administración de usuarios está reservada al administrador." />;
  }
  return children;
}
