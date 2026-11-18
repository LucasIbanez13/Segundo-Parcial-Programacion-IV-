"use client";

// Vuelve a pedir los datos de la página al servidor cuando falló la carga.
import { RotateCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";

export function BotonReintentar() {
  const router = useRouter();
  const [reintentando, iniciarTransicion] = useTransition();
  return (
    <Button variant="outline" onClick={() => iniciarTransicion(() => router.refresh())} disabled={reintentando}>
      <RotateCw className={reintentando ? "animate-spin" : undefined} /> {reintentando ? "Reintentando…" : "Reintentar"}
    </Button>
  );
}
