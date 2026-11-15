// Layout de todas las páginas privadas. Segunda barrera de la sección 10.5: vuelve a comprobar
// contra la base de datos que haya un usuario válido y activo (el proxy solo mira la firma de la cookie).
import { redirect } from "next/navigation";
import { Estructura } from "@/components/layout/Estructura";
import { getCurrentUser } from "@/lib/auth/sesion";

export default async function LayoutPrivado({ children }: { children: React.ReactNode }) {
  const usuario = await getCurrentUser();
  if (!usuario) redirect("/login");

  return <Estructura usuario={usuario}>{children}</Estructura>;
}
