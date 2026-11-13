"use client";

// Acciones de cada fila: editar, restablecer contraseña (RF-U5) y activar/desactivar (RF-U4).
// Las acciones irreversibles piden confirmación (sección 8).
import { KeyRound, Pencil, Power, PowerOff } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { editarUsuarioAccion, restablecerPasswordAccion } from "@/app/(app)/usuarios/acciones";
import { ConfirmarAccion } from "@/components/comunes/ConfirmarAccion";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { UsuarioPublico } from "@/services/usuarios.service";
import { DialogoPasswordTemporal } from "./DialogoPasswordTemporal";

function BotonIcono({
  etiqueta,
  children,
  className,
  ...props
}: React.ComponentProps<typeof Button> & { etiqueta: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={etiqueta} className={cn("size-8", className)} {...props}>
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{etiqueta}</TooltipContent>
    </Tooltip>
  );
}

export function AccionesUsuario({ usuario, esElMismo }: { usuario: UsuarioPublico; esElMismo: boolean }) {
  const [passwordTemporal, setPasswordTemporal] = useState<string | null>(null);

  async function restablecer() {
    const resultado = await restablecerPasswordAccion(usuario.id);
    if (!resultado.ok) {
      toast.error(resultado.error.message);
      return false;
    }
    setPasswordTemporal(resultado.data.passwordTemporal);
  }

  async function cambiarEstado() {
    const resultado = await editarUsuarioAccion(usuario.id, { activo: !usuario.activo });
    if (!resultado.ok) {
      toast.error(resultado.error.message);
      return false;
    }
    toast.success(resultado.data.activo ? "Usuario activado." : "Usuario desactivado: ya no puede entrar.");
  }

  return (
    <div className="flex items-center justify-end gap-0.5">
      <BotonIcono etiqueta="Editar" asChild>
        <Link href={`/usuarios/${usuario.id}`}>
          <Pencil />
        </Link>
      </BotonIcono>

      <ConfirmarAccion
        disparador={
          <BotonIcono etiqueta="Restablecer contraseña">
            <KeyRound />
          </BotonIcono>
        }
        titulo={`¿Restablecer la contraseña de ${usuario.nombre}?`}
        descripcion="Se genera una contraseña temporal nueva y la actual deja de funcionar. La vas a ver una sola vez."
        textoConfirmar="Restablecer"
        onConfirmar={restablecer}
      />

      {/* Un admin no puede desactivarse a sí mismo (OPERACION_SOBRE_SI_MISMO): no se ofrece el botón. */}
      {!esElMismo && (
        <ConfirmarAccion
          disparador={
            <BotonIcono
              etiqueta={usuario.activo ? "Desactivar" : "Activar"}
              className={usuario.activo ? "text-destructive hover:text-destructive" : "text-exito hover:text-exito"}
            >
              {usuario.activo ? <PowerOff /> : <Power />}
            </BotonIcono>
          }
          titulo={usuario.activo ? `¿Desactivar a ${usuario.nombre}?` : `¿Activar a ${usuario.nombre}?`}
          descripcion={
            usuario.activo
              ? "No va a poder iniciar sesión y pierde el acceso enseguida, aunque tenga una sesión abierta. Su historial se conserva."
              : "Va a poder volver a iniciar sesión con su contraseña."
          }
          textoConfirmar={usuario.activo ? "Desactivar" : "Activar"}
          peligrosa={usuario.activo}
          onConfirmar={cambiarEstado}
        />
      )}

      <DialogoPasswordTemporal
        nombre={usuario.nombre}
        password={passwordTemporal}
        onCerrar={() => setPasswordTemporal(null)}
      />
    </div>
  );
}
