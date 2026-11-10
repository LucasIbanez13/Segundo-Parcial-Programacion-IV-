// Pantalla 'Iniciar sesión' (usa components/auth/LoginForm).
import { redirect } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";
import Marco from "@/components/layout/Marco";
import PageHeader from "@/components/layout/PageHeader";
import { obtenerSesion } from "@/lib/auth/session";

export const metadata = { title: "Iniciar sesión · mostrador" };

const DESTINO_POR_DEFECTO = "/ventas/nueva";

// Solo se aceptan rutas internas ("/algo"), nunca otro sitio ("//sitio.com", "https://...").
function destinoSeguro(desde) {
  if (typeof desde !== "string" || !desde.startsWith("/") || desde.startsWith("//") || desde.startsWith("/\\")) {
    return DESTINO_POR_DEFECTO;
  }
  return desde;
}

export default async function LoginPage({ searchParams }) {
  const { desde } = await searchParams;
  const destino = destinoSeguro(desde);

  // Con una sesión válida no tiene sentido volver a ingresar.
  if (await obtenerSesion()) redirect(destino);

  return (
    <Marco>
      <PageHeader ruta="Acceso" titulo="Iniciar sesión" subtitulo="Ingresá con tu usuario para trabajar en el comercio." />
      <div className="grid grid-cols-[minmax(0,700px)_minmax(220px,320px)] items-start gap-[22px] max-[850px]:grid-cols-1">
        <LoginForm destino={destino} />
        <aside className="rounded-[9px] bg-help px-[22px] py-5 text-[13px] leading-[1.6] text-[#506958]">
          <h2 className="mb-2 text-sm font-bold text-[#294535]">Acceso al sistema</h2>
          <p>
            Solo las personas con un usuario activo pueden ingresar. La sesión se cierra al tocar «Cerrar sesión» o
            después de 8 horas.
          </p>
        </aside>
      </div>
    </Marco>
  );
}
