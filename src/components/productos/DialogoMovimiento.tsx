"use client";

// Ingreso (RF-P4) y egreso (RF-P5) manual de stock. Valida con el mismo esquema de Zod que el servidor:
// el motivo depende del tipo. stock.service vuelve a verificar el rol y que la existencia no quede negativa.
import { ArrowDownToLine, ArrowUpFromLine, PackagePlus } from "lucide-react";
import { useState } from "react";
import { Texto } from "@/components/base/primitivas";
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
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { registrarMovimientoAccion } from "@/app/(app)/productos/acciones";
import { useFormulario } from "@/hooks/use-formulario";
import { MOTIVOS_EGRESO, MOTIVOS_INGRESO } from "@/lib/constants";
import { textoAEntero } from "@/lib/format";
import { movimientoManualSchema } from "@/lib/schemas/stock";
import type { ProductoPublico } from "@/services/productos.service";
import type { MovimientoStockPublico } from "@/services/stock.service";

type Tipo = "ingreso" | "egreso";
type Valores = { tipo: Tipo; cantidad: string; motivo: string; observacion: string };

const MOTIVOS: Record<Tipo, readonly string[]> = { ingreso: MOTIVOS_INGRESO, egreso: MOTIVOS_EGRESO };
const VACIO: Valores = { tipo: "ingreso", cantidad: "", motivo: "", observacion: "" };

export function DialogoMovimiento({ producto }: { producto: ProductoPublico }) {
  const [abierto, setAbierto] = useState(false);
  const { valores, setValores, cambiar, errores, errorGeneral, enviando, onSubmit } = useFormulario<
    Valores,
    MovimientoStockPublico
  >({
    valoresIniciales: VACIO,
    esquema: movimientoManualSchema,
    preparar: ({ tipo, cantidad, motivo, observacion }) => ({
      tipo,
      cantidad: textoAEntero(cantidad),
      motivo: motivo || undefined,
      observacion: observacion.trim() || null,
    }),
    enviar: (datos) => registrarMovimientoAccion(producto.id, datos),
    mensajeExito: (data) =>
      `${data.tipo === "ingreso" ? "Ingreso" : "Egreso"} registrado. Existencia actual: ${data.existenciaResultante}.`,
    alExito: () => setAbierto(false),
  });

  // Vista previa de la existencia resultante: ayuda visual, el control real lo hace moverStock().
  const cantidad = textoAEntero(valores.cantidad);
  const resultante =
    cantidad !== undefined && Number.isInteger(cantidad) && cantidad > 0
      ? producto.existencia + (valores.tipo === "ingreso" ? cantidad : -cantidad)
      : null;

  return (
    <Dialog
      open={abierto}
      onOpenChange={(valor) => {
        setAbierto(valor);
        if (valor) setValores(VACIO);
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <PackagePlus /> Ingreso o egreso
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Movimiento de stock</DialogTitle>
            <DialogDescription>
              {producto.codigo} · {producto.descripcion}. Existencia actual: {producto.existencia}.
            </DialogDescription>
          </DialogHeader>

          <CampoFormulario id="tipo" etiqueta="Tipo" error={errores.tipo}>
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Tipo de movimiento">
              {(["ingreso", "egreso"] as const).map((tipo) => (
                <Button
                  key={tipo}
                  type="button"
                  role="radio"
                  aria-checked={valores.tipo === tipo}
                  variant={valores.tipo === tipo ? "default" : "outline"}
                  onClick={() => setValores((actuales) => ({ ...actuales, tipo, motivo: "" }))}
                >
                  {tipo === "ingreso" ? <ArrowDownToLine /> : <ArrowUpFromLine />}
                  {tipo === "ingreso" ? "Ingreso" : "Egreso"}
                </Button>
              ))}
            </div>
          </CampoFormulario>

          <div className="grid gap-4 sm:grid-cols-2">
            <CampoFormulario id="cantidad" etiqueta="Cantidad" error={errores.cantidad}>
              <Input
                {...propsDeCampo("cantidad", errores.cantidad)}
                type="number"
                min={1}
                step={1}
                inputMode="numeric"
                value={valores.cantidad}
                onChange={(e) => cambiar("cantidad", e.target.value)}
              />
            </CampoFormulario>
            <CampoFormulario id="motivo" etiqueta="Motivo" error={errores.motivo}>
              <Select value={valores.motivo} onValueChange={(valor) => cambiar("motivo", valor)}>
                <SelectTrigger {...propsDeCampo("motivo", errores.motivo)} className="w-full">
                  <SelectValue placeholder="Seleccioná un motivo">{valores.motivo || undefined}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {MOTIVOS[valores.tipo].map((motivo) => (
                    <SelectItem key={motivo} value={motivo}>
                      {motivo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CampoFormulario>
          </div>

          <CampoFormulario id="observacion" etiqueta="Observación (opcional)" error={errores.observacion}>
            <Input
              {...propsDeCampo("observacion", errores.observacion)}
              placeholder="Ej. Caída en depósito"
              autoComplete="off"
              value={valores.observacion}
              onChange={(e) => cambiar("observacion", e.target.value)}
            />
          </CampoFormulario>

          {resultante !== null && (
            <Texto variante={resultante < 0 ? "error" : "suave"}>
              {resultante < 0
                ? `No alcanza el stock: hay ${producto.existencia} unidades.`
                : `La existencia va a quedar en ${resultante}.`}
            </Texto>
          )}
          {errorGeneral && (
            <Alert variant="destructive">
              <AlertDescription>{errorGeneral}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button type="submit" disabled={enviando}>
              {enviando ? "Registrando…" : valores.tipo === "ingreso" ? "Registrar ingreso" : "Registrar egreso"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
