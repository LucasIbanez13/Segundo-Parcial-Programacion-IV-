// Acceso a datos de la tabla pagos: solo consultas Drizzle, sin reglas de negocio.
// Todas aceptan un ejecutor opcional para participar de una transacción.
import "server-only";
import { eq } from "drizzle-orm";
import { db, type Ejecutor } from "@/db";
import { clientes, pagos, usuarios, type PagoFila, type PagoNuevo } from "@/db/schema";

export async function insertar(datos: PagoNuevo, ejecutor: Ejecutor = db): Promise<PagoFila> {
  const [fila] = await ejecutor.insert(pagos).values(datos).returning();
  return fila;
}

// El pago con los datos del cliente y del usuario que cobró, para armar el recibo.
export async function buscarConDatos(id: number, ejecutor: Ejecutor = db) {
  const [fila] = await ejecutor
    .select({
      pago: pagos,
      cliente: { id: clientes.id, nombre: clientes.nombre, tipoDoc: clientes.tipoDoc, nroDoc: clientes.nroDoc },
      usuario: { id: usuarios.id, nombre: usuarios.nombre },
    })
    .from(pagos)
    .innerJoin(clientes, eq(pagos.clienteId, clientes.id))
    .innerJoin(usuarios, eq(pagos.usuarioId, usuarios.id))
    .where(eq(pagos.id, id))
    .limit(1);
  return fila ?? null;
}
