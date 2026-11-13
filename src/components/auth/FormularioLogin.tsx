"use client";

// Formulario de ingreso (RF-U1). Valida con el mismo esquema que el servidor y consume POST /api/auth/login.
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useState } from "react";
import { CampoFormulario, propsDeCampo } from "@/components/comunes/CampoFormulario";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useFormulario } from "@/hooks/use-formulario";
import { llamarApi } from "@/lib/http/resultado";
import { loginSchema } from "@/lib/schemas/auth";

export function FormularioLogin({ destino }: { destino: string }) {
  const [verPassword, setVerPassword] = useState(false);
  const { valores, cambiar, errores, errorGeneral, enviando, onSubmit } = useFormulario({
    valoresIniciales: { email: "", password: "" },
    esquema: loginSchema,
    enviar: (datos) => llamarApi("/api/auth/login", { method: "POST", body: datos }),
    // Recarga completa: el layout privado vuelve a leer la sesión desde el servidor.
    alExito: () => window.location.assign(destino),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Ingresá a tu cuenta</CardTitle>
        <CardDescription>Usá el email y la contraseña que te dio el administrador.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
          <CampoFormulario id="email" etiqueta="Email" error={errores.email}>
            <Input
              {...propsDeCampo("email", errores.email)}
              type="email"
              autoComplete="username"
              placeholder="nombre@comercio.com"
              autoFocus
              value={valores.email}
              onChange={(e) => cambiar("email", e.target.value)}
            />
          </CampoFormulario>

          <CampoFormulario id="password" etiqueta="Contraseña" error={errores.password}>
            <div className="relative">
              <Input
                {...propsDeCampo("password", errores.password)}
                type={verPassword ? "text" : "password"}
                autoComplete="current-password"
                className="pr-10"
                value={valores.password}
                onChange={(e) => cambiar("password", e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-0 right-0 text-muted-foreground"
                onClick={() => setVerPassword((valor) => !valor)}
                aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {verPassword ? <EyeOff /> : <Eye />}
              </Button>
            </div>
          </CampoFormulario>

          {errorGeneral && (
            <Alert variant="destructive">
              <AlertDescription>{errorGeneral}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={enviando} className="w-full">
            <LogIn />
            {enviando ? "Ingresando…" : "Ingresar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
