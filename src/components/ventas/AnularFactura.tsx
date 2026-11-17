"use client";

// Anular una factura (RF-V9): solo el administrador, con motivo obligatorio. El botón se muestra solo al admin,
// pero la regla la hace cumplir el servidor (403 al vendedor). La factura no se borra: queda anulada.
import { Ban } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { anularFacturaAccion } from "@/app/(app)/ventas/acciones";
import { CampoFormulario, propsDeCampo } from "@/components/comunes/CampoFormulario";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useFormulario } from "@/hooks/use-formulario";
import { anularFacturaSchema } from "@/lib/schemas/facturas";
import type { FacturaPublica } from "@/services/facturas.service";

function descripcion(factura: FacturaPublica): string {
  const renglones = factura.items.length === 1 ? "1 renglón" : `${factura.items.length} renglones`;
  const cuenta =
    factura.pago.forma === "cuenta_corriente" ? " y se acredita el total en la cuenta corriente del cliente" : "";
  return `Se reingresa el stock de ${renglones}${cuenta}. La factura no se borra: queda visible como anulada.`;
}

export function AnularFactura({ factura }: { factura: FacturaPublica }) {
  const [abierto, setAbierto] = useState(false);

  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive">
          <Ban /> Anular
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <FormularioAnulacion factura={factura} onCerrar={() => setAbierto(false)} />
      </DialogContent>
    </Dialog>
  );
}

function FormularioAnulacion({ factura, onCerrar }: { factura: FacturaPublica; onCerrar: () => void }) {
  const router = useRouter();
  const { valores, cambiar, errores, errorGeneral, enviando, onSubmit } = useFormulario<{ motivo: string }, FacturaPublica>({
    valoresIniciales: { motivo: "" },
    esquema: anularFacturaSchema,
    enviar: (datos) => anularFacturaAccion(factura.id, datos),
    mensajeExito: `Factura ${factura.numeroFormateado} anulada.`,
    alExito: () => {
      onCerrar();
      router.refresh();
    },
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <DialogHeader>
        <DialogTitle>Anular factura {factura.numeroFormateado}</DialogTitle>
        <DialogDescription>{descripcion(factura)}</DialogDescription>
      </DialogHeader>

      <CampoFormulario id="motivo" etiqueta="Motivo" error={errores.motivo}>
        <Textarea
          {...propsDeCampo("motivo", errores.motivo)}
          autoFocus
          maxLength={200}
          placeholder="Por ejemplo: error en la carga de cantidades"
          value={valores.motivo}
          onChange={(e) => cambiar("motivo", e.target.value)}
        />
      </CampoFormulario>

      {errorGeneral && (
        <Alert variant="destructive">
          <AlertDescription>{errorGeneral}</AlertDescription>
        </Alert>
      )}

      <DialogFooter className="gap-2">
        <Button type="button" variant="outline" onClick={onCerrar} disabled={enviando}>
          Cancelar
        </Button>
        <Button type="submit" variant="destructive" disabled={enviando}>
          {enviando ? "Anulando…" : "Anular factura"}
        </Button>
      </DialogFooter>
    </form>
  );
}
