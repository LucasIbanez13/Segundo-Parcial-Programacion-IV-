"use client";

// Usuario conectado en la barra superior (nombre y rol): al hacer clic se abre "Mi perfil" y "Cerrar sesión"
// (RF-U1, RF-U5). Al lado, un botón "Salir" siempre visible.
import { ChevronDown, KeyRound, LogOut } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { UsuarioSesion } from "@/lib/auth/permisos";
import { ETIQUETAS_ROL } from "@/lib/constants";
import { iniciales } from "@/lib/format";
import { llamarApi } from "@/lib/http/resultado";

export function MenuUsuario({ usuario }: { usuario: UsuarioSesion }) {
  const [saliendo, setSaliendo] = useState(false);

  async function cerrarSesion() {
    setSaliendo(true);
    const resultado = await llamarApi("/api/auth/logout", { method: "POST" });
    if (!resultado.ok && resultado.error.code !== "NO_AUTENTICADO") {
      setSaliendo(false);
      toast.error(resultado.error.message);
      return;
    }
    window.location.assign("/login");
  }

  return (
    <div className="flex items-center gap-1">
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-auto gap-2.5 px-2 py-1.5">
          <Avatar className="size-8">
            <AvatarFallback className="bg-secondary text-xs font-semibold text-secondary-foreground">
              {iniciales(usuario.nombre)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden flex-col items-start leading-tight sm:flex">
            <span className="text-sm font-medium">{usuario.nombre}</span>
            <span className="text-xs text-muted-foreground">{ETIQUETAS_ROL[usuario.rol]}</span>
          </span>
          <ChevronDown className="text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col">
          <span>{usuario.nombre}</span>
          <span className="text-xs font-normal text-muted-foreground">{usuario.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/perfil">
            <KeyRound /> Mi perfil y contraseña
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={cerrarSesion} disabled={saliendo} variant="destructive">
          <LogOut /> {saliendo ? "Cerrando sesión…" : "Cerrar sesión"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    {/* Botón de salir siempre visible en la barra superior (sección 4). */}
    <Button variant="ghost" size="sm" onClick={cerrarSesion} disabled={saliendo} className="text-muted-foreground">
      <LogOut />
      <span className="hidden sm:inline">{saliendo ? "Saliendo…" : "Salir"}</span>
      <span className="sr-only sm:hidden">Cerrar sesión</span>
    </Button>
    </div>
  );
}
