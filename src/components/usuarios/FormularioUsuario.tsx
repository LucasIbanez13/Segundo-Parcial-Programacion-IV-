"use client";

// Alta y edición de usuarios (RF-U4). Valida con los mismos esquemas de Zod que el servidor
// y guarda con Server Actions, que llaman a usuarios.service.
import { Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CampoFormulario, propsDeCampo } from "@/components/comunes/CampoFormulario";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, type FormEvent } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { crearUsuarioAccion, editarUsuarioAccion } from "@/app/(app)/usuarios/acciones";
import { useFormulario } from "@/hooks/use-formulario";
import { ETIQUETAS_ROL, PASSWORD_MINIMO, ROLES, type Rol } from "@/lib/constants";
import { crearUsuarioSchema, editarUsuarioSchema } from "@/lib/schemas/usuarios";
import type { UsuarioPublico } from "@/services/usuarios.service";

type Valores = { nombre: string; email: string; rol: Rol; activo: string; password: string; repetir: string };

export function FormularioUsuario({
  usuario = null,
  esElMismo = false,
}: {
  usuario?: UsuarioPublico | null;
  esElMismo?: boolean;
}) {
  const router = useRouter();
  const esEdicion = usuario !== null;

  const { valores, cambiar, errores, errorGeneral, enviando, onSubmit } = useFormulario<Valores, UsuarioPublico>({
    valoresIniciales: {
      nombre: usuario?.nombre ?? "",
      email: usuario?.email ?? "",
      rol: usuario?.rol ?? "vendedor",
      activo: String(usuario?.activo ?? true),
      password: "",
      repetir: "",
    },
    esquema: esEdicion ? editarUsuarioSchema : crearUsuarioSchema,
    preparar: ({ nombre, email, rol, activo, password }) => {
      if (!esEdicion) return { nombre, email, rol, password };
      // Para uno mismo no se envían rol ni estado: no se pueden cambiar.
      return esElMismo ? { nombre, email } : { nombre, email, rol, activo: activo === "true" };
    },
    validacionExtra: ({ password, repetir }) => ({
      repetir: !esEdicion && password !== repetir ? "Las contraseñas no coinciden." : undefined,
    }),
    enviar: (datos) => (esEdicion ? editarUsuarioAccion(usuario.id, datos) : crearUsuarioAccion(datos)),
    mensajeExito: (data) => (esEdicion ? `Se guardaron los cambios de ${data.nombre}.` : `Usuario ${data.nombre} creado.`),
    alExito: () => router.push("/usuarios"),
  });

  // Desactivar es una acción irreversible para la persona (pierde el acceso enseguida): se confirma antes (sección 8).
  const [confirmandoBaja, setConfirmandoBaja] = useState(false);
  const vaADesactivar = esEdicion && !esElMismo && usuario.activo && valores.activo === "false";

  function enviarFormulario(evento: FormEvent) {
    evento.preventDefault();
    if (vaADesactivar) setConfirmandoBaja(true);
    else void onSubmit();
  }

  return (
    <Card className="max-w-2xl">
      <AlertDialog open={confirmandoBaja} onOpenChange={setConfirmandoBaja}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desactivar a {usuario?.nombre}?</AlertDialogTitle>
            <AlertDialogDescription>
              No va a poder iniciar sesión y pierde el acceso enseguida, aunque tenga una sesión abierta. Su historial se
              conserva y lo podés volver a activar cuando quieras.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                setConfirmandoBaja(false);
                void onSubmit();
              }}
            >
              Desactivar y guardar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <form onSubmit={enviarFormulario} noValidate className="flex flex-col gap-6">
        <CardHeader>
          <CardTitle>Datos del usuario</CardTitle>
          <CardDescription>
            {esEdicion
              ? "La contraseña no se edita acá: usá “Restablecer contraseña” desde el listado."
              : "La contraseña es temporal: pasásela a la persona y pedile que la cambie desde “Mi perfil”."}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <CampoFormulario id="nombre" etiqueta="Nombre y apellido" error={errores.nombre} className="sm:col-span-2">
            <Input
              {...propsDeCampo("nombre", errores.nombre)}
              placeholder="Ej. Pablo Ruiz"
              autoComplete="off"
              value={valores.nombre}
              onChange={(e) => cambiar("nombre", e.target.value)}
            />
          </CampoFormulario>
          <CampoFormulario id="email" etiqueta="Email" error={errores.email} className="sm:col-span-2">
            <Input
              {...propsDeCampo("email", errores.email)}
              type="email"
              placeholder="nombre@comercio.com"
              autoComplete="off"
              value={valores.email}
              onChange={(e) => cambiar("email", e.target.value)}
            />
          </CampoFormulario>
          <CampoFormulario
            id="rol"
            etiqueta="Rol"
            error={errores.rol}
            ayuda={esElMismo ? "No podés cambiar tu propio rol." : "El vendedor no gestiona stock, productos, anulaciones ni usuarios."}
          >
            <Select value={valores.rol} onValueChange={(valor) => cambiar("rol", valor as Rol)} disabled={esElMismo}>
              <SelectTrigger {...propsDeCampo("rol", errores.rol)} className="w-full">
                <SelectValue>{ETIQUETAS_ROL[valores.rol]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((rol) => (
                  <SelectItem key={rol} value={rol}>
                    {ETIQUETAS_ROL[rol]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CampoFormulario>
          {esEdicion && (
            <CampoFormulario
              id="activo"
              etiqueta="Estado"
              error={errores.activo}
              ayuda={esElMismo ? "No podés desactivarte a vos mismo." : "Un usuario inactivo no puede iniciar sesión."}
            >
              <Select value={valores.activo} onValueChange={(valor) => cambiar("activo", valor)} disabled={esElMismo}>
                <SelectTrigger {...propsDeCampo("activo", errores.activo)} className="w-full">
                  <SelectValue>{valores.activo === "true" ? "Activo" : "Inactivo"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Activo</SelectItem>
                  <SelectItem value="false">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </CampoFormulario>
          )}
          {!esEdicion && (
            <>
              <CampoFormulario
                id="password"
                etiqueta="Contraseña temporal"
                error={errores.password}
                ayuda={`Al menos ${PASSWORD_MINIMO} caracteres.`}
                className="sm:col-start-1"
              >
                <Input
                  {...propsDeCampo("password", errores.password)}
                  type="password"
                  autoComplete="new-password"
                  value={valores.password}
                  onChange={(e) => cambiar("password", e.target.value)}
                />
              </CampoFormulario>
              <CampoFormulario id="repetir" etiqueta="Repetí la contraseña" error={errores.repetir}>
                <Input
                  {...propsDeCampo("repetir", errores.repetir)}
                  type="password"
                  autoComplete="new-password"
                  value={valores.repetir}
                  onChange={(e) => cambiar("repetir", e.target.value)}
                />
              </CampoFormulario>
            </>
          )}
          {errorGeneral && (
            <Alert variant="destructive" className="sm:col-span-2">
              <AlertDescription>{errorGeneral}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link href="/usuarios">Cancelar</Link>
          </Button>
          <Button type="submit" disabled={enviando} className="w-full sm:w-auto">
            <Save />
            {enviando ? "Guardando…" : esEdicion ? "Guardar cambios" : "Crear usuario"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
