// Consultas a la tabla clientes. Sin reglas de negocio.
// Todas aceptan `ejecutor`: se pasa `tx` para participar de una transacción.
// Lee ventas y pagos solo para calcular el saldo y el historial de la cuenta corriente.
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { clientes, pagos, ventas } from "@/db/schema";
import { FORMAS_PAGO } from "@/lib/constants";

// Comparación sin distinguir mayúsculas ni acentos. Requiere la extensión `unaccent`.
// Primero unaccent y después lower: con locale C, lower() no convierte letras acentuadas ("É").
// (Copia de productos.repository.js para no modificar ese módulo.)
function contieneNormalizado(columna, patron) {
  return sql`lower(unaccent(${columna})) LIKE lower(unaccent(${patron}))`;
}

// Escapa los comodines de LIKE para que "50%" busque ese texto literal.
function escaparLike(texto) {
  return texto.replace(/[\\%_]/g, "\\$&");
}

// Saldo = Σ ventas en cuenta corriente − Σ pagos. Se calcula siempre: no hay columna de saldo.
const saldoCentavos = sql`(
  COALESCE((
    SELECT sum(${ventas.totalCentavos}) FROM ${ventas}
    WHERE ${ventas.clienteId} = ${clientes.id} AND ${ventas.formaPago} = ${FORMAS_PAGO.CUENTA_CORRIENTE}
  ), 0)
  - COALESCE((SELECT sum(${pagos.importeCentavos}) FROM ${pagos} WHERE ${pagos.clienteId} = ${clientes.id}), 0)
)`.mapWith(Number);

const columnasCliente = {
  id: clientes.id,
  nombre: clientes.nombre,
  documento: clientes.documento,
  telefono: clientes.telefono,
  correo: clientes.correo,
  saldoCentavos,
};

export async function listarClientes({ q } = {}, ejecutor = db) {
  const condiciones = [];

  if (q) {
    const patron = `%${escaparLike(q)}%`;
    condiciones.push(
      sql`(${contieneNormalizado(clientes.nombre, patron)} OR ${contieneNormalizado(clientes.documento, patron)})`,
    );
  }

  return ejecutor
    .select(columnasCliente)
    .from(clientes)
    .where(and(...condiciones))
    .orderBy(asc(clientes.nombre), asc(clientes.id));
}

export async function obtenerClientePorId(id, ejecutor = db) {
  const [cliente] = await ejecutor.select(columnasCliente).from(clientes).where(eq(clientes.id, id));
  return cliente ?? null;
}

// SELECT ... FOR UPDATE: serializa los pagos del mismo cliente hasta que termine la transacción.
export async function bloquearCliente(id, tx) {
  const [cliente] = await tx.select({ id: clientes.id }).from(clientes).where(eq(clientes.id, id)).for("update");
  return cliente ?? null;
}

export async function crearCliente(datos, ejecutor = db) {
  const [cliente] = await ejecutor.insert(clientes).values(datos).returning();
  return cliente;
}

export async function actualizarCliente(id, cambios, ejecutor = db) {
  const [cliente] = await ejecutor.update(clientes).set(cambios).where(eq(clientes.id, id)).returning();
  return cliente ?? null;
}

// Ventas en cuenta corriente del cliente: son su deuda (no hay tabla de deudas).
export async function listarVentasEnCuentaCorriente(clienteId, ejecutor = db) {
  return ejecutor
    .select({ id: ventas.id, numero: ventas.numero, fecha: ventas.fecha, totalCentavos: ventas.totalCentavos })
    .from(ventas)
    .where(and(eq(ventas.clienteId, clienteId), eq(ventas.formaPago, FORMAS_PAGO.CUENTA_CORRIENTE)))
    .orderBy(desc(ventas.fecha), desc(ventas.id));
}
