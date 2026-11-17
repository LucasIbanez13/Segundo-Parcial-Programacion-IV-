"use server";

// Server Actions del módulo Clientes (sección 10.3). Llaman a los mismos servicios que la API REST:
// la validación, el rol y las reglas viven en clientes.service y pagos.service, no acá.
import { revalidatePath } from "next/cache";
import { accion } from "@/lib/http/accion";
import { crearCliente, editarCliente } from "@/services/clientes.service";
import { registrarPago } from "@/services/pagos.service";

// "layout" revalida /clientes y todas sus subrutas (ficha, saldos).
function refrescarClientes() {
  revalidatePath("/clientes", "layout");
}

export const crearClienteAccion = accion(async (usuario, datos: unknown) => {
  const nuevo = await crearCliente(usuario, datos);
  refrescarClientes();
  return nuevo;
});

export const editarClienteAccion = accion(async (usuario, id: number, datos: unknown) => {
  const editado = await editarCliente(usuario, id, datos);
  refrescarClientes();
  return editado;
});

export const registrarPagoAccion = accion(async (usuario, clienteId: number, datos: unknown) => {
  const recibo = await registrarPago(usuario, clienteId, datos);
  refrescarClientes();
  return recibo;
});
