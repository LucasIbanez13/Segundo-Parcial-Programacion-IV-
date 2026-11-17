// Acceso a datos de la tabla clientes: solo consultas Drizzle, sin reglas de negocio.
// Todas aceptan un ejecutor opcional para participar de una transacción.
import "server-only";
import { and, asc, count, desc, eq, gt, ne, or, sql, type SQL } from "drizzle-orm";
import { db, type Ejecutor } from "@/db";
import { clientes, type ClienteNuevo } from "@/db/schema";
import { saldoDeClienteSql } from "./movimientos-cuenta.repository";

// El saldo siempre se calcula desde movimientos_cuenta (regla 7): no hay columna de saldo.
// "clientes"."id" con la tabla explícita: así la subconsulta se correlaciona con el cliente de cada fila.
const saldo = saldoDeClienteSql(sql`${clientes}.${sql.identifier(clientes.id.name)}`);

// Columnas públicas: las normalizadas son internas (búsqueda y unicidad).
const COLUMNAS = {
  id: clientes.id,
  tipoDoc: clientes.tipoDoc,
  nroDoc: clientes.nroDoc,
  nombre: clientes.nombre,
  domicilio: clientes.domicilio,
  telefono: clientes.telefono,
  email: clientes.email,
  cuentaCorriente: clientes.cuentaCorriente,
  limiteCredito: clientes.limiteCredito,
  activo: clientes.activo,
  saldo,
};

export type ClienteConSaldoFila = {
  id: number;
  tipoDoc: "DNI" | "CUIT";
  nroDoc: string;
  nombre: string;
  domicilio: string | null;
  telefono: string | null;
  email: string | null;
  cuentaCorriente: boolean;
  limiteCredito: number | null;
  activo: boolean;
  saldo: number;
};

// Escapa los comodines de LIKE para que "50%" busque ese texto literal.
function patronContiene(texto: string): string {
  return `%${texto.replace(/[\\%_]/g, (caracter) => `\\${caracter}`)}%`;
}

type Filtros = { qNormalizado?: string; conDeuda?: boolean; activo?: boolean };

function condicionFiltros({ qNormalizado, conDeuda, activo }: Filtros): SQL | undefined {
  const condiciones: (SQL | undefined)[] = [];
  if (qNormalizado) {
    const patron = patronContiene(qNormalizado);
    condiciones.push(
      or(
        sql`${clientes.nombreBusqueda} LIKE ${patron} ESCAPE '\\'`,
        sql`${clientes.nroDocNormalizado} LIKE ${patron} ESCAPE '\\'`,
      ),
    );
  }
  if (activo !== undefined) condiciones.push(eq(clientes.activo, activo));
  if (conDeuda) condiciones.push(gt(saldo, 0));
  return and(...condiciones);
}

export async function listar(
  filtros: Filtros & { orden: "saldo" | "nombre"; limite: number; desplazamiento: number },
  ejecutor: Ejecutor = db,
): Promise<{ filas: ClienteConSaldoFila[]; total: number; totalSaldos: number }> {
  const condicion = condicionFiltros(filtros);
  const orden = filtros.orden === "saldo" ? [desc(saldo), asc(clientes.nombre), asc(clientes.id)] : [asc(clientes.nombre), asc(clientes.id)];

  const [filas, [totales]] = await Promise.all([
    ejecutor
      .select(COLUMNAS)
      .from(clientes)
      .where(condicion)
      .orderBy(...orden)
      .limit(filtros.limite)
      .offset(filtros.desplazamiento),
    ejecutor
      .select({ total: count(), totalSaldos: sql<number>`coalesce(sum(${saldo}), 0)`.mapWith(Number) })
      .from(clientes)
      .where(condicion),
  ]);
  return { filas, total: totales.total, totalSaldos: totales.totalSaldos };
}

export async function buscarPorId(id: number, ejecutor: Ejecutor = db): Promise<ClienteConSaldoFila | null> {
  const [fila] = await ejecutor.select(COLUMNAS).from(clientes).where(eq(clientes.id, id)).limit(1);
  return fila ?? null;
}

// `excluirId` permite ignorar al propio cliente cuando se está editando.
export async function existeDocumento(digitos: string, excluirId?: number, ejecutor: Ejecutor = db): Promise<boolean> {
  const [fila] = await ejecutor
    .select({ id: clientes.id })
    .from(clientes)
    .where(and(eq(clientes.nroDocNormalizado, digitos), excluirId === undefined ? undefined : ne(clientes.id, excluirId)))
    .limit(1);
  return Boolean(fila);
}

export async function insertar(datos: ClienteNuevo, ejecutor: Ejecutor = db): Promise<number> {
  const [fila] = await ejecutor.insert(clientes).values(datos).returning({ id: clientes.id });
  return fila.id;
}

export async function actualizar(
  id: number,
  cambios: Partial<Omit<ClienteNuevo, "id" | "createdAt">>,
  ejecutor: Ejecutor = db,
): Promise<void> {
  await ejecutor.update(clientes).set(cambios).where(eq(clientes.id, id));
}
