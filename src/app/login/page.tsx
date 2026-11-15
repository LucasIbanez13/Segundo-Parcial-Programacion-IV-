// /login — única página pública (RF-U2). Queda fuera del layout con panel lateral (sección 4).
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Pila, Texto } from "@/components/base/primitivas";
import { FormularioLogin } from "@/components/auth/FormularioLogin";
import { PanelLogin } from "@/components/auth/PanelLogin";
import { getCurrentUser } from "@/lib/auth/sesion";

export const metadata: Metadata = { title: "Iniciar sesión" };

// Solo se aceptan rutas internas para volver después de ingresar (evita redirecciones a otros sitios).
function destinoSeguro(desde: string | undefined): string {
  return desde && desde.startsWith("/") && !desde.startsWith("//") ? desde : "/";
}

export default async function PaginaLogin({ searchParams }: { searchParams: Promise<{ desde?: string }> }) {
  const { desde } = await searchParams;
  const destino = destinoSeguro(desde);
  if (await getCurrentUser()) redirect(destino);

  return (
    <PanelLogin>
      <Pila espacio={6}>
        <FormularioLogin destino={destino} />
        <Texto variante="chico" className="text-center">
          ¿No tenés usuario? Pedíselo a un administrador del comercio.
        </Texto>
      </Pila>
    </PanelLogin>
  );
}
