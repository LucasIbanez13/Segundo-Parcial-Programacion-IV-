"use client";

// Confirmación de acciones irreversibles (sección 8): anular, dar de baja, desactivar.
import { useState, type ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function ConfirmarAccion({
  disparador,
  titulo,
  descripcion,
  textoConfirmar = "Confirmar",
  peligrosa = false,
  onConfirmar,
}: {
  disparador: ReactNode;
  titulo: string;
  descripcion: ReactNode;
  textoConfirmar?: string;
  peligrosa?: boolean;
  // Si devuelve false, el diálogo queda abierto (por ejemplo, si la operación falló).
  onConfirmar: () => Promise<boolean | void> | boolean | void;
}) {
  const [abierto, setAbierto] = useState(false);
  const [procesando, setProcesando] = useState(false);

  async function confirmar(evento: React.MouseEvent) {
    evento.preventDefault();
    setProcesando(true);
    const resultado = await onConfirmar();
    setProcesando(false);
    if (resultado !== false) setAbierto(false);
  }

  return (
    <AlertDialog open={abierto} onOpenChange={(valor) => !procesando && setAbierto(valor)}>
      <AlertDialogTrigger asChild>{disparador}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{titulo}</AlertDialogTitle>
          <AlertDialogDescription>{descripcion}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={procesando}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={confirmar}
            disabled={procesando}
            variant={peligrosa ? "destructive" : "default"}
          >
            {procesando ? "Procesando…" : textoConfirmar}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
