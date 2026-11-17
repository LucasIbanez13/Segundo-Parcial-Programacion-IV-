"use server";

// Server Actions del módulo Ventas (sección 10.3). Llaman a los mismos servicios que la API REST:
// la validación, el rol y las reglas viven en facturas.service, no acá.
import { revalidatePath } from "next/cache";
import { accion } from "@/lib/http/accion";
import { anularFactura, emitirFactura } from "@/services/facturas.service";

// Una factura cambia ventas, existencias y saldos: se revalida todo lo que los muestra.
function refrescar() {
  revalidatePath("/ventas", "layout");
  revalidatePath("/productos", "layout");
  revalidatePath("/clientes", "layout");
}

export const emitirFacturaAccion = accion(async (usuario, datos: unknown) => {
  const factura = await emitirFactura(usuario, datos);
  refrescar();
  return factura;
});

export const anularFacturaAccion = accion(async (usuario, id: number, datos: unknown) => {
  const factura = await anularFactura(usuario, id, datos);
  refrescar();
  return factura;
});
