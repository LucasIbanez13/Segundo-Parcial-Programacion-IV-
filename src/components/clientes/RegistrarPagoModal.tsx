"use client";

// Registrar un pago a cuenta (RF-C5). Adelanta las reglas en la interfaz (importe > 0 y que no supere la deuda,
// regla 8), pero el servidor las vuelve a verificar dentro de la transacción.
import { registrarPagoAccion } from "@/app/(app)/clientes/acciones";
import { CampoImporte } from "@/components/comunes/CampoImporte";
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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useFormulario } from "@/hooks/use-formulario";
import { ETIQUETAS_MEDIO_PAGO, MEDIOS_PAGO, type MedioPago } from "@/lib/constants";
import { centavosATextoEditable, formatearMoneda, textoACentavos } from "@/lib/format";
import { registrarPagoSchema } from "@/lib/schemas/clientes";
import { cn } from "@/lib/utils";
import type { Recibo } from "@/services/pagos.service";

type ClienteDelPago = { id: number; nombre: string; saldo: number };
type Valores = { importe: string; medio: MedioPago; observacion: string };

export function RegistrarPagoModal({
  cliente,
  open,
  onOpenChange,
  onRegistrado,
}: {
  cliente: ClienteDelPago;
  open: boolean;
  onOpenChange: (abierto: boolean) => void;
  onRegistrado: (recibo: Recibo) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
        <FormularioPago cliente={cliente} onCerrar={() => onOpenChange(false)} onRegistrado={onRegistrado} />
      </DialogContent>
    </Dialog>
  );
}

function FormularioPago({
  cliente,
  onCerrar,
  onRegistrado,
}: {
  cliente: ClienteDelPago;
  onCerrar: () => void;
  onRegistrado: (recibo: Recibo) => void;
}) {
  const { valores, cambiar, errores, errorGeneral, enviando, onSubmit } = useFormulario<Valores, Recibo>({
    valoresIniciales: { importe: "", medio: "efectivo", observacion: "" },
    esquema: registrarPagoSchema,
    preparar: ({ importe, medio, observacion }) => ({
      importe: textoACentavos(importe) ?? Number.NaN,
      medio,
      observacion,
    }),
    validacionExtra: ({ importe }) => {
      const centavos = textoACentavos(importe);
      if (importe.trim() === "") return { importe: "Ingresá el importe." };
      if (centavos === undefined || Number.isNaN(centavos)) return { importe: "Ingresá un importe válido, por ejemplo 5000 o 5.000,50." };
      if (centavos > cliente.saldo) return { importe: `No puede superar la deuda (${formatearMoneda(cliente.saldo)}).` };
      return {};
    },
    // El botón queda deshabilitado mientras se envía: evita registrar el cobro dos veces.
    enviar: (datos) => registrarPagoAccion(cliente.id, datos),
    mensajeExito: (recibo) => `Pago registrado: recibo ${recibo.numeroRecibo}.`,
    alExito: (recibo) => {
      onCerrar();
      onRegistrado(recibo);
    },
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <DialogHeader>
        <DialogTitle>Registrar pago</DialogTitle>
        <DialogDescription>
          {cliente.nombre} · saldo adeudado {formatearMoneda(cliente.saldo)}
        </DialogDescription>
      </DialogHeader>

      <CampoFormulario id="importe" etiqueta="Importe" error={errores.importe}>
        <CampoImporte
          {...propsDeCampo("importe", errores.importe)}
          autoFocus
          className="text-right"
          value={valores.importe}
          onChange={(e) => cambiar("importe", e.target.value)}
        />
      </CampoFormulario>
      <div className="-mt-2 flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => cambiar("importe", centavosATextoEditable(cliente.saldo))}>
          Saldo total
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => cambiar("importe", centavosATextoEditable(Math.floor(cliente.saldo / 2)))}
        >
          La mitad
        </Button>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">Medio de pago</legend>
        <div role="radiogroup" className="grid gap-2 sm:grid-cols-3">
          {MEDIOS_PAGO.map((medio) => {
            const elegido = valores.medio === medio;
            return (
              <label
                key={medio}
                className={cn(
                  "flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                  elegido ? "border-primary bg-primary/5" : "hover:bg-muted/50",
                )}
              >
                <input
                  type="radio"
                  name="medio"
                  value={medio}
                  checked={elegido}
                  onChange={() => cambiar("medio", medio as MedioPago)}
                  className="size-4 accent-primary"
                />
                {ETIQUETAS_MEDIO_PAGO[medio]}
              </label>
            );
          })}
        </div>
        {errores.medio && <p className="text-sm text-destructive">{errores.medio}</p>}
      </fieldset>

      <CampoFormulario id="observacion" etiqueta="Observación (opcional)" error={errores.observacion}>
        <Input
          {...propsDeCampo("observacion", errores.observacion)}
          maxLength={200}
          value={valores.observacion}
          onChange={(e) => cambiar("observacion", e.target.value)}
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
        <Button type="submit" disabled={enviando}>
          {enviando ? "Registrando…" : "Registrar pago"}
        </Button>
      </DialogFooter>
    </form>
  );
}
