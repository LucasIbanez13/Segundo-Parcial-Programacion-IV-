"use client";

// Nueva venta (RF-V1): una sola pantalla con ítems, comprador y forma de pago; el total se recalcula en cada
// cambio. Se opera con teclado: F2 producto, F4 cliente, F8 pago, F9 confirmar.
// La interfaz adelanta las reglas (existencia, cuenta corriente, límite, monto), pero el servidor las vuelve
// a verificar al confirmar y es quien pone precios, total y número (RF-V6).
import { Check, CreditCard, Wallet, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { emitirFacturaAccion } from "@/app/(app)/ventas/acciones";
import { CampoImporte } from "@/components/comunes/CampoImporte";
import { ConfirmarAccion } from "@/components/comunes/ConfirmarAccion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { type FormaPago, type TipoTarjeta } from "@/lib/constants";
import { formatearMoneda, textoACentavos } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ClientePublico } from "@/services/clientes.service";
import type { FacturaPublica } from "@/services/facturas.service";
import { BuscadorProductos, type ProductoVenta } from "./BuscadorProductos";
import { Segmentos } from "./Segmentos";
import { SelectorComprador } from "./SelectorComprador";
import { TablaItems, type ItemVenta } from "./TablaItems";

function Tecla({ children }: { children: React.ReactNode }) {
  return <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">{children}</kbd>;
}

function Renglon({ etiqueta, children, fuerte = false }: { etiqueta: string; children: React.ReactNode; fuerte?: boolean }) {
  return (
    <div className={cn("flex items-center justify-between gap-3 text-sm", fuerte ? "font-medium" : "text-muted-foreground")}>
      <span>{etiqueta}</span>
      <span className={cn("tabular-nums", !fuerte && "text-foreground")}>{children}</span>
    </div>
  );
}

type DetalleStock = { productoId: number; disponible: number };

export function NuevaVenta({ vendedor, proximoNumero }: { vendedor: string; proximoNumero: string }) {
  const router = useRouter();
  const buscadorRef = useRef<HTMLInputElement>(null);
  const clienteRef = useRef<HTMLInputElement>(null);
  const pagoRef = useRef<HTMLDivElement>(null);

  const [items, setItems] = useState<ItemVenta[]>([]);
  const [modoComprador, setModoComprador] = useState<"final" | "registrado">("final");
  const [cliente, setCliente] = useState<ClientePublico | null>(null);
  const [forma, setForma] = useState<FormaPago>("contado");
  const [montoRecibido, setMontoRecibido] = useState("");
  const [tarjeta, setTarjeta] = useState<{ tipo: TipoTarjeta; marca: string; ultimos4: string }>({
    tipo: "debito",
    marca: "",
    ultimos4: "",
  });
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [confirmando, setConfirmando] = useState(false);
  // F4 pide el foco en la búsqueda de cliente; se da después de que el buscador se dibuja.
  const [pedidoFocoCliente, setPedidoFocoCliente] = useState(0);
  useEffect(() => {
    if (pedidoFocoCliente > 0) clienteRef.current?.focus();
  }, [pedidoFocoCliente]);

  // RF-V1: el total se recalcula en cada cambio (solo para mostrar).
  const total = items.reduce((suma, item) => suma + item.precio * item.cantidad, 0);
  const unidades = items.reduce((suma, item) => suma + item.cantidad, 0);

  // Regla 6: cuenta corriente solo para un cliente registrado y habilitado.
  const puedeCuenta = Boolean(cliente?.cuentaCorriente);
  useEffect(() => {
    if (forma === "cuenta_corriente" && !puedeCuenta) setForma("contado");
  }, [forma, puedeCuenta]);

  const recibido = montoRecibido.trim() === "" ? total : textoACentavos(montoRecibido);
  const montoValido = recibido !== undefined && !Number.isNaN(recibido);
  const vuelto = montoValido && recibido! >= total ? recibido! - total : 0;
  const saldoResultante = (cliente?.saldo ?? 0) + total;
  const superaLimite = cliente?.limiteCredito != null && saldoResultante > cliente.limiteCredito;

  function agregar(producto: ProductoVenta, cantidad: number) {
    setErrorGeneral(null);
    setItems((actuales) => {
      // RF-V3: agregar un producto que ya está suma la cantidad al renglón existente.
      const existente = actuales.find((item) => item.id === producto.id);
      if (existente) {
        return actuales.map((item) =>
          item.id === producto.id ? { ...item, ...producto, cantidad: item.cantidad + cantidad } : item,
        );
      }
      return [...actuales, { ...producto, cantidad }];
    });
  }

  function descartar() {
    setItems([]);
    setCliente(null);
    setModoComprador("final");
    setForma("contado");
    setMontoRecibido("");
    setTarjeta({ tipo: "debito", marca: "", ultimos4: "" });
    setErrores({});
    setErrorGeneral(null);
    buscadorRef.current?.focus();
  }

  // Lo que se valida antes de llamar al servidor, para avisar junto al campo.
  function validarEnInterfaz(): Record<string, string> {
    const nuevos: Record<string, string> = {};
    if (items.length === 0) nuevos.items = "Agregá al menos un producto.";
    if (modoComprador === "registrado" && !cliente) nuevos.cliente = "Seleccioná un cliente o elegí Consumidor final.";
    if (forma === "contado" && montoRecibido.trim() !== "") {
      if (!montoValido) nuevos.montoRecibido = "Ingresá un importe válido, por ejemplo 20000 o 20.000,50.";
      else if (recibido! < total) nuevos.montoRecibido = `Tiene que cubrir el total de ${formatearMoneda(total)}.`;
    }
    if (forma === "tarjeta") {
      if (!tarjeta.marca.trim()) nuevos.marca = "Ingresá la marca.";
      if (!/^\d{4}$/.test(tarjeta.ultimos4)) nuevos.ultimos4 = "Ingresá exactamente los últimos 4 dígitos.";
    }
    if (forma === "cuenta_corriente" && superaLimite) {
      nuevos.cuenta = "La venta supera el límite de crédito del cliente.";
    }
    return nuevos;
  }

  async function confirmar() {
    if (confirmando) return;
    setErrorGeneral(null);
    const nuevos = validarEnInterfaz();
    setErrores(nuevos);
    if (Object.keys(nuevos).length > 0) return;

    const pago =
      forma === "contado"
        ? montoRecibido.trim() === ""
          ? { forma }
          : { forma, montoRecibido: recibido }
        : forma === "tarjeta"
          ? { forma, tarjeta: { tipo: tarjeta.tipo, marca: tarjeta.marca.trim(), ultimos4: tarjeta.ultimos4 } }
          : { forma };

    // Solo productos y cantidades: precios, subtotales y total los calcula el servidor (sección 11.1).
    setConfirmando(true);
    const resultado = await emitirFacturaAccion({
      clienteId: cliente?.id ?? null,
      items: items.map((item) => ({ productoId: item.id, cantidad: item.cantidad })),
      pago,
    });
    setConfirmando(false);

    if (resultado.ok) {
      const factura: FacturaPublica = resultado.data;
      toast.success(`Factura ${factura.numeroFormateado} emitida.`);
      router.push(`/ventas/${factura.id}`);
      return;
    }

    const { error } = resultado;
    // Si otra venta se llevó el stock mientras tanto, se actualiza lo disponible en cada renglón.
    if (error.code === "STOCK_INSUFICIENTE" && Array.isArray(error.details)) {
      const porProducto = new Map((error.details as DetalleStock[]).map((d) => [d.productoId, d.disponible]));
      setItems((actuales) =>
        actuales.map((item) => (porProducto.has(item.id) ? { ...item, existencia: porProducto.get(item.id)! } : item)),
      );
    }
    if (error.code === "MONTO_INSUFICIENTE") setErrores({ montoRecibido: error.message });
    if (error.code === "VALIDACION" && Array.isArray(error.details)) {
      const porCampo: Record<string, string> = {};
      for (const { campo, mensaje } of error.details as { campo: string; mensaje: string }[]) {
        porCampo[campo.split(".").pop() ?? campo] = mensaje;
      }
      setErrores(porCampo);
    }
    setErrorGeneral(error.message);
    toast.error(error.message);
  }

  // Atajos de teclado (RF-V1).
  useEffect(() => {
    function alPresionar(evento: KeyboardEvent) {
      if (evento.key === "F2") {
        evento.preventDefault();
        buscadorRef.current?.focus();
      } else if (evento.key === "F4") {
        evento.preventDefault();
        setModoComprador("registrado");
        setPedidoFocoCliente((actual) => actual + 1);
      } else if (evento.key === "F8") {
        evento.preventDefault();
        pagoRef.current?.querySelector<HTMLElement>("[role=radio][aria-checked=true]")?.focus();
      } else if (evento.key === "F9") {
        evento.preventDefault();
        void confirmar();
      }
    }
    window.addEventListener("keydown", alPresionar);
    return () => window.removeEventListener("keydown", alPresionar);
  });

  useEffect(() => buscadorRef.current?.focus(), []);

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_24rem]">
      <Card>
        <CardHeader>
          <CardTitle>Ítems</CardTitle>
          <CardAction className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {items.length} {items.length === 1 ? "renglón" : "renglones"} · <Tecla>F2</Tecla> buscar
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <BuscadorProductos
            ref={buscadorRef}
            onAgregar={agregar}
            cantidadEnVenta={(id) => items.find((item) => item.id === id)?.cantidad ?? 0}
          />
          {errores.items && <p className="text-sm text-destructive">{errores.items}</p>}
          <TablaItems
            items={items}
            onCambiarCantidad={(id, cantidad) =>
              setItems((actuales) => actuales.map((item) => (item.id === id ? { ...item, cantidad } : item)))
            }
            onQuitar={(id) => setItems((actuales) => actuales.filter((item) => item.id !== id))}
          />
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Comprador</CardTitle>
            <CardAction className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Tecla>F4</Tecla> buscar cliente
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <SelectorComprador
              ref={clienteRef}
              cliente={cliente}
              onCambiar={(nuevo) => {
                setCliente(nuevo);
                setErrores((actuales) => ({ ...actuales, cliente: "" }));
                if (nuevo) setModoComprador("registrado");
              }}
              modo={modoComprador}
              onModo={setModoComprador}
            />
            {errores.cliente && <p className="text-sm text-destructive">{errores.cliente}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Forma de pago</CardTitle>
            <CardAction className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Tecla>F8</Tecla> ir al pago
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div ref={pagoRef}>
              <Segmentos
                etiqueta="Forma de pago"
                valor={forma}
                onCambiar={(nueva) => {
                  setForma(nueva);
                  setErrores({});
                }}
                opciones={[
                  { valor: "contado", texto: <><Wallet /> Contado</> },
                  { valor: "tarjeta", texto: <><CreditCard /> Tarjeta</> },
                  {
                    valor: "cuenta_corriente",
                    texto: "Cta. cte.",
                    deshabilitada: !puedeCuenta,
                    motivo: "Solo para un cliente registrado con cuenta corriente habilitada.",
                  },
                ]}
              />
            </div>

            {forma === "contado" && (
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-[1fr_auto] items-end gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="montoRecibido">Monto recibido</Label>
                    <CampoImporte
                      id="montoRecibido"
                      aria-invalid={Boolean(errores.montoRecibido) || undefined}
                      className="text-right"
                      placeholder={formatearMoneda(total).replace("$", "").trim()}
                      value={montoRecibido}
                      onChange={(e) => {
                        setMontoRecibido(e.target.value);
                        setErrores((actuales) => ({ ...actuales, montoRecibido: "" }));
                      }}
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">Vuelto</span>
                    <span className="text-xl font-semibold tabular-nums">{formatearMoneda(vuelto)}</span>
                  </div>
                </div>
                {errores.montoRecibido ? (
                  <p className="text-sm text-destructive">{errores.montoRecibido}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">Si lo dejás vacío, se toma el importe justo.</p>
                )}
              </div>
            )}

            {forma === "tarjeta" && (
              <div className="flex flex-col gap-3">
                <Segmentos
                  etiqueta="Tipo de tarjeta"
                  valor={tarjeta.tipo}
                  onCambiar={(tipo) => setTarjeta((actual) => ({ ...actual, tipo }))}
                  opciones={[
                    { valor: "debito", texto: "Débito" },
                    { valor: "credito", texto: "Crédito" },
                  ]}
                />
                <div className="grid grid-cols-[1fr_7rem] gap-3">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="marca">Marca</Label>
                    <Input
                      id="marca"
                      placeholder="Visa, Mastercard…"
                      maxLength={40}
                      aria-invalid={Boolean(errores.marca) || undefined}
                      value={tarjeta.marca}
                      onChange={(e) => setTarjeta((actual) => ({ ...actual, marca: e.target.value }))}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="ultimos4">Últimos 4</Label>
                    <Input
                      id="ultimos4"
                      inputMode="numeric"
                      maxLength={4}
                      placeholder="1234"
                      className="text-center font-mono"
                      aria-invalid={Boolean(errores.ultimos4) || undefined}
                      value={tarjeta.ultimos4}
                      onChange={(e) => setTarjeta((actual) => ({ ...actual, ultimos4: e.target.value.replace(/\D/g, "") }))}
                    />
                  </div>
                </div>
                {(errores.marca || errores.ultimos4) && (
                  <p className="text-sm text-destructive">{errores.marca || errores.ultimos4}</p>
                )}
                <p className="text-xs text-muted-foreground">Nunca se pide ni se guarda el número completo de la tarjeta.</p>
              </div>
            )}

            {forma === "cuenta_corriente" && cliente && (
              <div className="flex flex-col gap-2">
                <Renglon etiqueta="Saldo actual">{formatearMoneda(cliente.saldo)}</Renglon>
                <Renglon etiqueta="Esta factura">+ {formatearMoneda(total)}</Renglon>
                <Separator />
                <Renglon etiqueta="Saldo resultante" fuerte>
                  <span className={cn(superaLimite && "text-destructive")}>{formatearMoneda(saldoResultante)}</span>
                </Renglon>
                <Renglon etiqueta="Límite de crédito">
                  {cliente.limiteCredito === null ? "Sin límite" : formatearMoneda(cliente.limiteCredito)}
                </Renglon>
                {superaLimite && (
                  <p className="text-sm text-destructive">
                    La venta supera el límite por {formatearMoneda(saldoResultante - cliente.limiteCredito!)}.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-3">
            <Renglon etiqueta="Unidades">{unidades}</Renglon>
            <Renglon etiqueta="Vendedor">{vendedor}</Renglon>
            <Renglon etiqueta="Número">
              <span className="font-mono">{proximoNumero} (al confirmar)</span>
            </Renglon>
            <Separator />
            <div className="flex items-end justify-between gap-3">
              <span className="font-medium">Total</span>
              <span className="text-3xl font-semibold tracking-tight tabular-nums">{formatearMoneda(total)}</span>
            </div>

            {errorGeneral && (
              <Alert variant="destructive">
                <AlertDescription>{errorGeneral}</AlertDescription>
              </Alert>
            )}

            {/* El botón queda deshabilitado mientras se confirma: evita emitir la factura dos veces. */}
            <Button size="lg" className="w-full justify-between" onClick={confirmar} disabled={confirmando || items.length === 0}>
              <span className="flex items-center gap-2">
                <Check /> {confirmando ? "Confirmando…" : "Confirmar factura"}
              </span>
              <kbd className="rounded border border-current/30 px-1.5 py-0.5 font-mono text-[11px]">F9</kbd>
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Al confirmar se verifica el stock, se descuenta y se asigna el número.
            </p>
            {items.length > 0 && (
              <ConfirmarAccion
                disparador={
                  <Button variant="ghost" size="sm" className="self-center">
                    <X /> Descartar venta
                  </Button>
                }
                titulo="¿Descartar la venta?"
                descripcion="Se quitan los productos, el comprador y la forma de pago. No se graba nada."
                textoConfirmar="Descartar"
                peligrosa
                onConfirmar={descartar}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
