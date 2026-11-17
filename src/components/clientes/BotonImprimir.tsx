"use client";

// Botón que abre el diálogo de impresión del navegador. No se imprime a sí mismo.
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BotonImprimir({ variant = "default" }: { variant?: "default" | "outline" }) {
  return (
    <Button variant={variant} onClick={() => window.print()} className="print:hidden">
      <Printer /> Imprimir
    </Button>
  );
}
