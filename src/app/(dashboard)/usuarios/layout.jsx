// Las pantallas de usuarios son solo para administradores. Se verifica en el servidor:
// un operador que entre por URL vuelve a ventas. (La API, además, le responde 403.)
import { redirect } from "next/navigation";
import { obtenerSesion } from "@/lib/auth/session";

export default async function UsuariosLayout({ children }) {
  const sesion = await obtenerSesion();
  if (!sesion) redirect("/login");
  if (!sesion.usuario.administrador) redirect("/ventas/nueva");

  return children;
}
