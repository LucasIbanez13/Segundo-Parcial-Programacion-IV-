"use client";

// Botón "Nuevo cliente" del encabezado: abre el modal de alta (RF-C2).
import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ClienteFormModal } from "./ClienteFormModal";

export function BotonNuevoCliente() {
  const [abierto, setAbierto] = useState(false);
  return (
    <>
      <Button onClick={() => setAbierto(true)}>
        <Plus /> Nuevo cliente
      </Button>
      <ClienteFormModal open={abierto} onOpenChange={setAbierto} />
    </>
  );
}
