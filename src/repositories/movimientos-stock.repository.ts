// Acceso a datos de la tabla movimientos_stock: solo consultas Drizzle, sin reglas de negocio.
// Todas aceptan un ejecutor opcional para participar de una transacción.
import "server-only";
import { and, count, desc, eq, gte, lt, type SQL } from "drizzle-orm";
import { db, type Ejecutor } from "@/db";
import { facturas, movimientosStock, productos, usuarios, type MovimientoStockNuevo } from "@/db/schema";
import type { TipoMovimientoStock } from "@/lib/constants";

// Ventas y anulaciones traen el número de su factura (left join: ingresos y egresos no tienen).
const COLUMNAS_PUBLICAS = {
  id: movimientosStock.id,
  producto: { id: productos.id, codigo: productos.codigo },
  tipo: movimientosStock.tipo,
  cantidad: movimientosStock.cantidad,
  existenciaResultante: movimientosStock.existenciaResultante,
  motivo: movimientosStock.motivo,
  observacion: movimientosStock.observacion,
  facturaId: movimientosStock.facturaId,
  facturaPuntoVenta: facturas.puntoVenta,
  facturaNumero: facturas.numero,
  usuario: { id: usuarios.id, nombre: usuarios.nombre },
  fecha: movimientosStock.fecha,
};

export type MovimientoStockPublicoFila = {
  id: number;
  producto: { id: number; codigo: string };
  tipo: TipoMovimientoStock;
  cantidad: number;
  existenciaResultante: number;
  motivo: string;
  observacion: string | null;
  facturaId: number | null;
  facturaPuntoVenta: number | null;
  facturaNumero: number | null;
  usuario: { id: number; nombre: string };
  fecha: Date;
};

export type FiltrosMovimientosRepo = {
  productoId?: number;
  tipo?: TipoMovimientoStock;
  desde?: Date;
  hasta?: Date;
  limite: number;
  desplazamiento: number;
};

function condicionFiltros(filtros: Omit<FiltrosMovimientosRepo, "limite" | "desplazamiento">): SQL | undefined {
  return and(
    filtros.productoId === undefined ? undefined : eq(movimientosStock.productoId, filtros.productoId),
    filtros.tipo === undefined ? undefined : eq(movimientosStock.tipo, filtros.tipo),
    filtros.desde === undefined ? undefined : gte(movimientosStock.fecha, filtros.desde),
    filtros.hasta === undefined ? undefined : lt(movimientosStock.fecha, filtros.hasta),
  );
}

// Del más nuevo al más viejo (sección 11.4).
export async function listar(
  filtros: FiltrosMovimientosRepo,
  ejecutor: Ejecutor = db,
): Promise<{ filas: MovimientoStockPublicoFila[]; total: number }> {
  const condicion = condicionFiltros(filtros);
  const [filas, [{ total }]] = await Promise.all([
    ejecutor
      .select(COLUMNAS_PUBLICAS)
      .from(movimientosStock)
      .innerJoin(productos, eq(movimientosStock.productoId, productos.id))
      .innerJoin(usuarios, eq(movimientosStock.usuarioId, usuarios.id))
      .leftJoin(facturas, eq(movimientosStock.facturaId, facturas.id))
      .where(condicion)
      .orderBy(desc(movimientosStock.fecha), desc(movimientosStock.id))
      .limit(filtros.limite)
      .offset(filtros.desplazamiento),
    ejecutor.select({ total: count() }).from(movimientosStock).where(condicion),
  ]);
  return { filas, total };
}

export async function buscarPorId(id: number, ejecutor: Ejecutor = db): Promise<MovimientoStockPublicoFila | null> {
  const [fila] = await ejecutor
    .select(COLUMNAS_PUBLICAS)
    .from(movimientosStock)
    .innerJoin(productos, eq(movimientosStock.productoId, productos.id))
    .innerJoin(usuarios, eq(movimientosStock.usuarioId, usuarios.id))
    .leftJoin(facturas, eq(movimientosStock.facturaId, facturas.id))
    .where(eq(movimientosStock.id, id))
    .limit(1);
  return fila ?? null;
}

export async function insertar(
  datos: Omit<MovimientoStockNuevo, "id" | "createdAt">,
  ejecutor: Ejecutor,
): Promise<number> {
  const [fila] = await ejecutor.insert(movimientosStock).values(datos).returning({ id: movimientosStock.id });
  return fila.id;
}
