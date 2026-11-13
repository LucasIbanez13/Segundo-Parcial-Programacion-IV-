"use client";

// Cambio de la propia contraseña (RF-U5). Consume PUT /api/auth/password con { actual, nueva }.
// "Repetir contraseña" solo existe en la interfaz: al servidor se manda una sola vez.
import { KeyRound } from "lucide-react";
import { CampoFormulario, propsDeCampo } from "@/components/comunes/CampoFormulario";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useFormulario } from "@/hooks/use-formulario";
import { PASSWORD_MINIMO } from "@/lib/constants";
import { llamarApi } from "@/lib/http/resultado";
import { cambiarPasswordSchema } from "@/lib/schemas/auth";

const VACIO = { actual: "", nueva: "", repetir: "" };

export function FormularioCambiarPassword() {
  const { valores, setValores, cambiar, errores, errorGeneral, enviando, onSubmit } = useFormulario({
    valoresIniciales: VACIO,
    esquema: cambiarPasswordSchema,
    preparar: ({ actual, nueva }) => ({ actual, nueva }),
    validacionExtra: ({ nueva, repetir }) => ({
      repetir: repetir !== nueva ? "Las contraseñas no coinciden." : undefined,
    }),
    enviar: (datos) => llamarApi("/api/auth/password", { method: "PUT", body: datos }),
    mensajeExito: "Listo, tu contraseña se cambió.",
    alExito: () => setValores(VACIO),
  });

  return (
    <Card>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
        <CardHeader>
          <CardTitle>Cambiar contraseña</CardTitle>
          <CardDescription>
            Ingresá tu contraseña actual y elegí una nueva de al menos {PASSWORD_MINIMO} caracteres.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <CampoFormulario id="actual" etiqueta="Contraseña actual" error={errores.actual}>
            <Input
              {...propsDeCampo("actual", errores.actual)}
              type="password"
              autoComplete="current-password"
              value={valores.actual}
              onChange={(e) => cambiar("actual", e.target.value)}
            />
          </CampoFormulario>
          <CampoFormulario id="nueva" etiqueta="Contraseña nueva" error={errores.nueva}>
            <Input
              {...propsDeCampo("nueva", errores.nueva)}
              type="password"
              autoComplete="new-password"
              value={valores.nueva}
              onChange={(e) => cambiar("nueva", e.target.value)}
            />
          </CampoFormulario>
          <CampoFormulario id="repetir" etiqueta="Repetí la contraseña nueva" error={errores.repetir}>
            <Input
              {...propsDeCampo("repetir", errores.repetir)}
              type="password"
              autoComplete="new-password"
              value={valores.repetir}
              onChange={(e) => cambiar("repetir", e.target.value)}
            />
          </CampoFormulario>
          {errorGeneral && (
            <Alert variant="destructive">
              <AlertDescription>{errorGeneral}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" disabled={enviando}>
            <KeyRound />
            {enviando ? "Guardando…" : "Cambiar contraseña"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
