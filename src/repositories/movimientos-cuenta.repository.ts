// Acceso a datos de movimientos_cuenta: solo consultas Drizzle, sin reglas de negocio.
// Todas aceptan un ejecutor opcional para participar de una transacción.
import "server-only";
import { and, asc, eq, gte, lt, lte, sql, type SQL, type SQLWrapper } from "drizzle-orm";
import { db, type Ejecutor } from "@/db";
import { movimientosCuenta, type MovimientoCuentaFila, type MovimientoCuentaNuevo } from "@/db/schema";

// Σ débitos − Σ créditos de los movimientos que cumplen la condición (0 si no hay ninguno).
const SUMA_CON_SIGNO = sql<number>`coalesce(sum(case when ${movimientosCuenta.tipo} = 'debito' then ${movimientosCuenta.importe} else -${movimientosCuenta.importe} end), 0)`;

// Subconsulta con el saldo de un cliente, para usar dentro de otra consulta (por ejemplo, el listado).
// `clienteId` es la columna de la consulta de afuera, escrita con su tabla (ver clientes.repository).
// Las columnas van con el nombre de la tabla a propósito: en un select de una sola tabla, Drizzle las
// escribe sin él, y dentro de la subconsulta `"id"` sería el id del movimiento y no el del cliente.
export function saldoDeClienteSql(clienteId: SQLWrapper): SQL<number> {
  const clienteDelMovimiento = sql`${movimientosCuenta}.${sql.identifier(movimientosCuenta.clienteId.name)}`;
  return sql<number>`(select ${SUMA_CON_SIGNO} from ${movimientosCuenta} where ${clienteDelMovimiento} = ${clienteId})`.mapWith(
    Number,
  );
}

// Saldo de un cliente. `antesDe` corta por fecha (saldo anterior a un día); `hastaId` incluye solo
// los movimientos hasta ese id (saldo que quedó después de un pago, para reimprimir el recibo).
export async function sumarSaldo(
  clienteId: number,
  { antesDe, hastaId }: { antesDe?: Date; hastaId?: number } = {},
  ejecutor: Ejecutor = db,
): Promise<number> {
  const [fila] = await ejecutor
    .select({ saldo: SUMA_CON_SIGNO })
    .from(movimientosCuenta)
    .where(
      and(
        eq(movimientosCuenta.clienteId, clienteId),
        antesDe ? lt(movimientosCuenta.fecha, antesDe) : undefined,
        hastaId !== undefined ? lte(movimientosCuenta.id, hastaId) : undefined,
      ),
    );
  return Number(fila?.saldo ?? 0);
}

// Movimientos de un cliente en orden cronológico (del más viejo al más nuevo). `hastaExclusivo` no se incluye.
export async function listarDeCliente(
  clienteId: number,
  { desde, hastaExclusivo }: { desde?: Date; hastaExclusivo?: Date } = {},
  ejecutor: Ejecutor = db,
): Promise<MovimientoCuentaFila[]> {
  return ejecutor
    .select()
    .from(movimientosCuenta)
    .where(
      and(
        eq(movimientosCuenta.clienteId, clienteId),
        desde ? gte(movimientosCuenta.fecha, desde) : undefined,
        hastaExclusivo ? lt(movimientosCuenta.fecha, hastaExclusivo) : undefined,
      ),
    )
    .orderBy(asc(movimientosCuenta.fecha), asc(movimientosCuenta.id));
}

export async function insertar(datos: MovimientoCuentaNuevo, ejecutor: Ejecutor = db): Promise<MovimientoCuentaFila> {
  const [fila] = await ejecutor.insert(movimientosCuenta).values(datos).returning();
  return fila;
}

// Id del crédito que generó un pago.
export async function buscarIdPorPago(pagoId: number, ejecutor: Ejecutor = db): Promise<number | null> {
  const [fila] = await ejecutor
    .select({ id: movimientosCuenta.id })
    .from(movimientosCuenta)
    .where(eq(movimientosCuenta.pagoId, pagoId))
    .limit(1);
  return fila?.id ?? null;
}
