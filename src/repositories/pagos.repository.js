// Consultas a la tabla pagos. Sin reglas de negocio.
// Todas aceptan `ejecutor`: se pasa `tx` para participar de una transacción.
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { pagos } from "@/db/schema";

export async function crearPago(datos, ejecutor = db) {
  const [pago] = await ejecutor.insert(pagos).values(datos).returning();
  return pago;
}

export async function listarPagosDeCliente(clienteId, ejecutor = db) {
  return ejecutor
    .select()
    .from(pagos)
    .where(eq(pagos.clienteId, clienteId))
    .orderBy(desc(pagos.fecha), desc(pagos.id));
}
