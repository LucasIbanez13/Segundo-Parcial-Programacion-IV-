// /usuarios — listado de usuarios (RF-U4). Server Component que llama al servicio.
// Búsqueda, filtro y página viven en la URL (sección 10.6).
import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { EncabezadoPagina } from "@/components/comunes/EncabezadoPagina";
import { EstadoError } from "@/components/comunes/Estados";
import { Paginador } from "@/components/comunes/Paginador";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FiltrosUsuarios } from "@/components/usuarios/FiltrosUsuarios";
import { TablaUsuarios } from "@/components/usuarios/TablaUsuarios";
import { getCurrentUser } from "@/lib/auth/sesion";
import { ApiError } from "@/lib/errors";
import { listarUsuarios } from "@/services/usuarios.service";

export const metadata: Metadata = { title: "Usuarios" };

type Parametros = { q?: string; activo?: string; page?: string };

export default async function PaginaUsuarios({ searchParams }: { searchParams: Promise<Parametros> }) {
  const usuario = await getCurrentUser();
  if (!usuario) redirect("/login");
  const parametros = await searchParams;

  let pagina;
  try {
    pagina = await listarUsuarios(usuario, parametros);
  } catch (error) {
    if (error instanceof ApiError) return <EstadoError mensaje={error.message} />;
    throw error;
  }

  return (
    <>
      <EncabezadoPagina
        titulo="Usuarios"
        descripcion="Quiénes pueden entrar al sistema y con qué rol."
        acciones={
          <Button asChild>
            <Link href="/usuarios/nuevo">
              <Plus /> Nuevo usuario
            </Link>
          </Button>
        }
      />
      <Card>
        <CardContent className="flex flex-col gap-4">
          <FiltrosUsuarios q={parametros.q ?? ""} activo={parametros.activo ?? ""} />
          <TablaUsuarios usuarios={pagina.data} idActual={usuario.id} hayFiltros={Boolean(parametros.q || (parametros.activo && parametros.activo !== "todos"))}
          />
          <Paginador
            ruta="/usuarios"
            parametros={{ q: parametros.q, activo: parametros.activo }}
            page={pagina.page}
            pageSize={pagina.pageSize}
            total={pagina.total}
          />
        </CardContent>
      </Card>
    </>
  );
}
