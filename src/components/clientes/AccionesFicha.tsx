"use client";

// Botones de la ficha (RF-C3): registrar un pago (RF-C5), editar (RF-C2) y dar de baja o reactivar (RF-C7).
// Al registrar el pago se abre su recibo. La baja pide confirmación (sección 8) y no se ofrece con saldo
// pendiente: el servidor igual la rechaza con 422 SALDO_PENDIENTE.
import { Archive, ArchiveRestore, HandCoins, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { editarClienteAccion } from "@/app/(app)/clientes/acciones";
import { ConfirmarAccion } from "@/components/comunes/ConfirmarAccion";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { ClientePublico } from "@/services/clientes.service";
import { ClienteFormModal } from "./ClienteFormModal";
import { RegistrarPagoModal } from "./RegistrarPagoModal";

function motivoSinPago(cliente: ClientePublico): string | null {
  if (!cliente.activo) return "El cliente está dado de baja.";
  if (!cliente.cuentaCorriente) return "No tiene la cuenta corriente habilitada.";
  if (cliente.saldo <= 0) return "No tiene deuda para pagar.";
  return null;
}

// Un botón deshabilitado no recibe el mouse: el span hace que el tooltip explique por qué.
function BotonDeshabilitado({ motivo, children }: { motivo: string; children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span tabIndex={0}>{children}</span>
      </TooltipTrigger>
      <TooltipContent>{motivo}</TooltipContent>
    </Tooltip>
  );
}

export function AccionesFicha({ cliente }: { cliente: ClientePublico }) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [pagando, setPagando] = useState(false);
  const motivo = motivoSinPago(cliente);

  async function cambiarEstado() {
    const resultado = await editarClienteAccion(cliente.id, { activo: !cliente.activo });
    if (!resultado.ok) {
      toast.error(resultado.error.message);
      return false;
    }
    toast.success(resultado.data.activo ? `${cliente.nombre} está activo otra vez.` : `${cliente.nombre} quedó dado de baja.`);
    router.refresh();
  }

  return (
    <>
      {motivo ? (
        <BotonDeshabilitado motivo={motivo}>
          <Button disabled>
            <HandCoins /> Registrar pago
          </Button>
        </BotonDeshabilitado>
      ) : (
        <Button onClick={() => setPagando(true)}>
          <HandCoins /> Registrar pago
        </Button>
      )}

      <Button variant="outline" onClick={() => setEditando(true)}>
        <Pencil /> Editar
      </Button>

      {cliente.activo && cliente.saldo !== 0 ? (
        <BotonDeshabilitado motivo="Tiene saldo pendiente: no se puede dar de baja.">
          <Button variant="outline" disabled>
            <Archive /> Dar de baja
          </Button>
        </BotonDeshabilitado>
      ) : (
        <ConfirmarAccion
          disparador={
            <Button variant="outline">
              {cliente.activo ? <Archive /> : <ArchiveRestore />}
              {cliente.activo ? "Dar de baja" : "Reactivar"}
            </Button>
          }
          titulo={cliente.activo ? `¿Dar de baja a ${cliente.nombre}?` : `¿Reactivar a ${cliente.nombre}?`}
          descripcion={
            cliente.activo
              ? "Deja de aparecer en el listado y no se le puede vender. Su historial de facturas y pagos se conserva."
              : "Vuelve a aparecer en el listado y se le puede vender."
          }
          textoConfirmar={cliente.activo ? "Dar de baja" : "Reactivar"}
          peligrosa={cliente.activo}
          onConfirmar={cambiarEstado}
        />
      )}

      <ClienteFormModal clienteEditar={cliente} open={editando} onOpenChange={setEditando} />
      <RegistrarPagoModal
        cliente={cliente}
        open={pagando}
        onOpenChange={setPagando}
        onRegistrado={(recibo) => router.push(`/clientes/recibos/${recibo.id}`)}
      />
    </>
  );
}
