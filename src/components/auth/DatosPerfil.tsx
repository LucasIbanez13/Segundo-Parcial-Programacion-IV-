// Datos del usuario conectado en /perfil.
import { Fila, Pila, Texto } from "@/components/base/primitivas";
import { Insignia } from "@/components/comunes/InsigniaEstado";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { UsuarioSesion } from "@/lib/auth/permisos";
import { ETIQUETAS_ROL } from "@/lib/constants";
import { iniciales } from "@/lib/format";

export function DatosPerfil({ usuario }: { usuario: UsuarioSesion }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tus datos</CardTitle>
        <CardDescription>Para cambiar tu nombre, email o rol pedíselo a un administrador.</CardDescription>
      </CardHeader>
      <CardContent>
        <Fila espacio={4}>
          <Avatar className="size-14">
            <AvatarFallback className="bg-primary text-lg font-semibold text-primary-foreground">
              {iniciales(usuario.nombre)}
            </AvatarFallback>
          </Avatar>
          <Pila espacio={1}>
            <Texto variante="fuerte" className="text-base">
              {usuario.nombre}
            </Texto>
            <Texto variante="suave">{usuario.email}</Texto>
            <Insignia tono={usuario.rol === "admin" ? "principal" : "neutro"}>{ETIQUETAS_ROL[usuario.rol]}</Insignia>
          </Pila>
        </Fila>
      </CardContent>
    </Card>
  );
}
