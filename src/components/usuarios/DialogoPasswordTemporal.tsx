"use client";

// Muestra UNA sola vez la contraseña temporal generada por el restablecimiento (RF-U5).
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Texto } from "@/components/base/primitivas";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function DialogoPasswordTemporal({
  nombre,
  password,
  onCerrar,
}: {
  nombre: string;
  password: string | null;
  onCerrar: () => void;
}) {
  const [copiada, setCopiada] = useState(false);

  async function copiar() {
    if (!password) return;
    await navigator.clipboard.writeText(password).catch(() => undefined);
    setCopiada(true);
  }

  return (
    <Dialog
      open={password !== null}
      onOpenChange={(abierto) => {
        if (!abierto) {
          setCopiada(false);
          onCerrar();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Contraseña temporal de {nombre}</DialogTitle>
          <DialogDescription>
            Pasásela a la persona por un medio seguro. Cuando cierres esta ventana no se vuelve a mostrar.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2 rounded-md border bg-muted px-4 py-3">
          <code className="flex-1 font-mono text-lg tracking-wider">{password}</code>
          <Button variant="outline" size="sm" onClick={copiar}>
            {copiada ? <Check /> : <Copy />} {copiada ? "Copiada" : "Copiar"}
          </Button>
        </div>
        <Texto variante="chico">Recomendale cambiarla desde “Mi perfil” apenas ingrese.</Texto>
        <DialogFooter>
          <Button onClick={onCerrar}>Listo</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
