// Layout de las secciones protegidas: Sidebar + Header (usuario y cerrar sesión).
// Verifica la sesión en el servidor: token vigente y usuario todavía activo.
import { redirect } from "next/navigation";
import Marco from "@/components/layout/Marco";
import { obtenerSesion } from "@/lib/auth/session";

export default async function DashboardLayout({ children }) {
  const sesion = await obtenerSesion();
  if (!sesion) redirect("/login");

  return <Marco usuario={sesion.usuario}>{children}</Marco>;
}
