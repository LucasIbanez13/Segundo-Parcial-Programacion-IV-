"use client";

// Alta y edición de clientes en un modal (RF-C2). Es autónomo para poder usarlo también desde Nueva venta
// (RF-V2: alta en el momento sin perder la venta): recibe open/onOpenChange y avisa con onSuccess.
// Valida con los mismos esquemas de Zod que el servidor y guarda con Server Actions.
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { crearClienteAccion, editarClienteAccion } from "@/app/(app)/clientes/acciones";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useFormulario } from "@/hooks/use-formulario";
import { TIPOS_DOC, type TipoDoc } from "@/lib/constants";
import { centavosATextoEditable, textoACentavos } from "@/lib/format";
import { crearClienteSchema, editarClienteSchema } from "@/lib/schemas/clientes";
import type { ClientePublico } from "@/services/clientes.service";

type Valores = {
  tipoDoc: TipoDoc;
  nroDoc: string;
  nombre: string;
  domicilio: string;
  telefono: string;
  email: string;
  cuentaCorriente: boolean;
  limiteCredito: string;
};

type Props = {
  clienteEditar?: ClientePublico | null;
  open: boolean;
  onOpenChange: (abierto: boolean) => void;
  onSuccess?: (cliente: ClientePublico) => void;
};

export function ClienteFormModal({ clienteEditar = null, open, onOpenChange, onSuccess }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
        {/* El formulario se monta al abrir: cada vez arranca con los datos del cliente elegido. */}
        <FormularioCliente cliente={clienteEditar} onCerrar={() => onOpenChange(false)} onSuccess={onSuccess} />
      </DialogContent>
    </Dialog>
  );
}

function FormularioCliente({
  cliente,
  onCerrar,
  onSuccess,
}: {
  cliente: ClientePublico | null;
  onCerrar: () => void;
  onSuccess?: (cliente: ClientePublico) => void;
}) {
  const router = useRouter();
  const esEdicion = cliente !== null;

  const { valores, cambiar, errores, errorGeneral, enviando, onSubmit } = useFormulario<Valores, ClientePublico>({
    valoresIniciales: {
      tipoDoc: cliente?.tipoDoc ?? "DNI",
      nroDoc: cliente?.nroDoc ?? "",
      nombre: cliente?.nombre ?? "",
      domicilio: cliente?.domicilio ?? "",
      telefono: cliente?.telefono ?? "",
      email: cliente?.email ?? "",
      cuentaCorriente: cliente?.cuentaCorriente ?? false,
      limiteCredito: cliente?.limiteCredito ? centavosATextoEditable(cliente.limiteCredito) : "",
    },
    esquema: esEdicion ? editarClienteSchema : crearClienteSchema,
    // Pesos a centavos. Sin cuenta corriente no hay límite; vacío = sin límite.
    preparar: ({ limiteCredito, cuentaCorriente, ...resto }) => ({
      ...resto,
      cuentaCorriente,
      limiteCredito:
        !cuentaCorriente || limiteCredito.trim() === "" ? null : (textoACentavos(limiteCredito) ?? Number.NaN),
    }),
    validacionExtra: ({ cuentaCorriente, limiteCredito }) => ({
      limiteCredito:
        cuentaCorriente && limiteCredito.trim() !== "" && Number.isNaN(textoACentavos(limiteCredito))
          ? "Ingresá un importe válido, por ejemplo 400000 o 400.000,50."
          : undefined,
    }),
    enviar: (datos) => (esEdicion ? editarClienteAccion(cliente.id, datos) : crearClienteAccion(datos)),
    mensajeExito: (data) => (esEdicion ? `Se guardaron los cambios de ${data.nombre}.` : `Cliente ${data.nombre} creado.`),
    alExito: (data) => {
      onSuccess?.(data);
      onCerrar();
      router.refresh();
    },
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <DialogHeader>
        <DialogTitle>{esEdicion ? `Editar a ${cliente.nombre}` : "Nuevo cliente"}</DialogTitle>
        <DialogDescription>
          {esEdicion
            ? "Los cambios no modifican las facturas ya emitidas."
            : "Ingresá su documento y sus datos. El teléfono, el email y el domicilio son opcionales."}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
        <CampoFormulario id="tipoDoc" etiqueta="Tipo" error={errores.tipoDoc}>
          <Select value={valores.tipoDoc} onValueChange={(valor) => cambiar("tipoDoc", valor as TipoDoc)}>
            <SelectTrigger {...propsDeCampo("tipoDoc", errores.tipoDoc)} className="w-full">
              <SelectValue>{valores.tipoDoc}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {TIPOS_DOC.map((tipo) => (
                <SelectItem key={tipo} value={tipo}>
                  {tipo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CampoFormulario>
        <CampoFormulario id="nroDoc" etiqueta="Número de documento" error={errores.nroDoc}>
          <Input
            {...propsDeCampo("nroDoc", errores.nroDoc)}
            inputMode="numeric"
            autoComplete="off"
            placeholder={valores.tipoDoc === "DNI" ? "Ej. 28.456.123" : "Ej. 20-28456123-4"}
            value={valores.nroDoc}
            onChange={(e) => cambiar("nroDoc", e.target.value)}
          />
        </CampoFormulario>
        <CampoFormulario id="nombre" etiqueta="Nombre o razón social" error={errores.nombre} className="sm:col-span-2">
          <Input
            {...propsDeCampo("nombre", errores.nombre)}
            autoComplete="off"
            placeholder="Ej. Mariana López"
            value={valores.nombre}
            onChange={(e) => cambiar("nombre", e.target.value)}
          />
        </CampoFormulario>
        <CampoFormulario id="domicilio" etiqueta="Domicilio" error={errores.domicilio} className="sm:col-span-2">
          <Input
            {...propsDeCampo("domicilio", errores.domicilio)}
            autoComplete="off"
            placeholder="Ej. Las Heras 455"
            value={valores.domicilio}
            onChange={(e) => cambiar("domicilio", e.target.value)}
          />
        </CampoFormulario>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <CampoFormulario id="telefono" etiqueta="Teléfono" error={errores.telefono}>
          <Input
            {...propsDeCampo("telefono", errores.telefono)}
            type="tel"
            autoComplete="off"
            placeholder="Ej. 381 455-2210"
            value={valores.telefono}
            onChange={(e) => cambiar("telefono", e.target.value)}
          />
        </CampoFormulario>
        <CampoFormulario id="email" etiqueta="Email" error={errores.email}>
          <Input
            {...propsDeCampo("email", errores.email)}
            type="email"
            autoComplete="off"
            placeholder="nombre@correo.com"
            value={valores.email}
            onChange={(e) => cambiar("email", e.target.value)}
          />
        </CampoFormulario>
      </div>

      <div className="grid gap-4 rounded-lg border bg-muted/30 p-4 sm:grid-cols-2">
        <CampoFormulario
          id="cuentaCorriente"
          etiqueta="Cuenta corriente"
          error={errores.cuentaCorriente}
          ayuda={valores.cuentaCorriente ? "Puede comprar a cuenta." : "Solo puede comprar al contado o con tarjeta."}
        >
          <Switch
            {...propsDeCampo("cuentaCorriente", errores.cuentaCorriente)}
            checked={valores.cuentaCorriente}
            onCheckedChange={(valor) => cambiar("cuentaCorriente", valor)}
            aria-label="Habilitado para cuenta corriente"
          />
        </CampoFormulario>
        <CampoFormulario
          id="limiteCredito"
          etiqueta="Límite de crédito ($)"
          error={errores.limiteCredito}
          ayuda="Opcional. Vacío = sin límite."
        >
          <Input
            {...propsDeCampo("limiteCredito", errores.limiteCredito)}
            inputMode="decimal"
            autoComplete="off"
            placeholder="Ej. 400.000"
            disabled={!valores.cuentaCorriente}
            value={valores.cuentaCorriente ? valores.limiteCredito : ""}
            onChange={(e) => cambiar("limiteCredito", e.target.value)}
          />
        </CampoFormulario>
      </div>

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
          <Save />
          {enviando ? "Guardando…" : esEdicion ? "Guardar cambios" : "Crear cliente"}
        </Button>
      </DialogFooter>
    </form>
  );
}
