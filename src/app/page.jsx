// Página inicial: redirige a /ventas/nueva si hay sesión o a /login si no.
import { redirect } from "next/navigation";
import { obtenerSesion } from "@/lib/auth/session";

export default async function HomePage() {
  redirect((await obtenerSesion()) ? "/ventas/nueva" : "/login");
}
