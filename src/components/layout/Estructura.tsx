// Estructura general de las páginas privadas: panel lateral + barra superior + contenido (sección 4).
import type { ReactNode } from "react";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import type { UsuarioSesion } from "@/lib/auth/permisos";
import { MenuUsuario } from "./MenuUsuario";
import { PanelLateral } from "./PanelLateral";

export function Estructura({ usuario, children }: { usuario: UsuarioSesion; children: ReactNode }) {
  return (
    <SidebarProvider>
      <PanelLateral rol={usuario.rol} />
      <SidebarInset className="min-w-0">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-2 border-b bg-background/90 px-4 backdrop-blur sm:px-6">
          <SidebarTrigger aria-label="Abrir o cerrar el menú" />
          <Separator orientation="vertical" className="mr-1 data-[orientation=vertical]:h-5" />
          <div className="ml-auto">
            <MenuUsuario usuario={usuario} />
          </div>
        </header>
        {/* SidebarInset ya es el <main> de la página: acá va un contenedor común. */}
        <div className="mx-auto flex w-full min-w-0 max-w-6xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:py-8">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
