"use client";

// Panel lateral fijo con los cinco módulos (sección 4) y el módulo activo resaltado.
// En pantallas chicas se colapsa en un menú desplegable (lo resuelve el Sidebar de shadcn/ui).
import { House, Package, ReceiptText, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import type { Rol } from "@/lib/constants";
import { Marca } from "./Marca";

const MODULOS = [
  { href: "/", texto: "Inicio", icono: House },
  { href: "/ventas", texto: "Ventas", icono: ReceiptText },
  { href: "/productos", texto: "Productos", icono: Package },
  { href: "/clientes", texto: "Clientes", icono: Users },
  { href: "/usuarios", texto: "Usuarios", icono: ShieldCheck, soloAdmin: true },
];

function estaActivo(rutaActual: string, href: string) {
  return href === "/" ? rutaActual === "/" : rutaActual === href || rutaActual.startsWith(`${href}/`);
}

// El módulo Usuarios solo se ofrece al administrador. Es una ayuda visual: el servidor igual responde 403.
export function PanelLateral({ rol }: { rol: Rol }) {
  const rutaActual = usePathname();
  const { setOpenMobile } = useSidebar();
  const modulos = MODULOS.filter((modulo) => !modulo.soloAdmin || rol === "admin");

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-5">
        <Marca invertida />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Módulos</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {modulos.map(({ href, texto, icono: Icono }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton asChild isActive={estaActivo(rutaActual, href)} size="lg">
                    <Link href={href} onClick={() => setOpenMobile(false)}>
                      <Icono />
                      <span>{texto}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="px-4 pb-4 text-xs text-sidebar-foreground/60">
        Comprobantes internos, sin validez fiscal.
      </SidebarFooter>
    </Sidebar>
  );
}
