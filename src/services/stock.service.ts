// Servicio de stock (sección 10.2). Contiene moverStock(), la ÚNICA función que cambia la existencia de un
// producto. Ingresos, egresos, ventas y anulaciones la llaman; ninguna modifica la existencia por su cuenta.
import "server-only";
import { db, type Ejecutor } from "@/db";
import { exigirRol, type UsuarioSesion } from "@/lib/auth/permisos";
import type { TipoMovimientoStock } from "@/lib/constants";
import { ApiError, errores } from "@/lib/errors";
import type { Pagina } from "@/lib/schemas/comun";
import { filtrosMovimientosProductoSchema, filtrosMovimientosSchema, movimientoManualSchema } from "@/lib/schemas/stock";
import { validar } from "@/lib/schemas/validar";
import * as movimientosRepo from "@/repositories/movimientos-stock.repository";
import type { MovimientoStockPublicoFila } from "@/repositories/movimientos-stock.repository";
import * as productosRepo from "@/repositories/productos.repository";

// Forma pública de un movimiento (sección 11.4). En ventas y anulaciones, referencia trae la factura.
export type MovimientoStockPublico = Omit<MovimientoStockPublicoFila, "facturaId" | "fecha"> & {
  referencia: { facturaId: number; numero: string | null } | null;
  fecha: string;
};

function aPublico({ facturaId, fecha, ...resto }: MovimientoStockPublicoFila): MovimientoStockPublico {
  return {
    ...resto,
    // El número de factura se resuelve cuando exista la tabla facturas (hito 3, ventas).
    referencia: facturaId === null ? null : { facturaId, numero: null },
    fecha: fecha.toISOString(),
  };
}

// Venta y egreso restan; ingreso y anulación suman (sección 7).
const RESTAN: ReadonlySet<TipoMovimientoStock> = new Set(["venta", "egreso"]);

export type DatosMovimiento = {
  productoId: number;
  usuarioId: number;
  tipo: TipoMovimientoStock;
  // Siempre positiva: el signo lo pone moverStock() según el tipo.
  cantidad: number;
  motivo: string;
  observacion?: string | null;
  facturaId?: number | null;
};

// Regla 1 y regla 2, sección 10.2. Actualiza la existencia con un UPDATE condicional
// (existencia + delta >= 0) y graba el movimiento con la existencia resultante.
// Recibe la transacción abierta por quien la llama (`tx`): así el movimiento, la existencia y el resto
// de la operación (por ejemplo, la factura) se graban todos juntos o no se graba nada.
// El UPDATE condicional es atómico: si dos ventas piden la última unidad a la vez, solo una lo logra
// y la otra recibe 409 STOCK_INSUFICIENTE (lista de control 10.8, punto 4).
export async function moverStock(tx: Ejecutor, datos: DatosMovimiento): Promise<MovimientoStockPublicoFila> {
  if (!Number.isInteger(datos.cantidad) || datos.cantidad <= 0) {
    throw new Error(`moverStock: la cantidad debe ser un entero positivo (llegó ${datos.cantidad}).`);
  }
  const delta = RESTAN.has(datos.tipo) ? -datos.cantidad : datos.cantidad;

  const existenciaResultante = await productosRepo.sumarExistencia(datos.productoId, delta, tx);
  if (existenciaResultante === null) {
    const producto = await productosRepo.buscarExistencia(datos.productoId, tx);
    if (!producto) throw errores.noEncontrado("El producto");
    throw new ApiError(
      409,
      "STOCK_INSUFICIENTE",
      `No hay stock suficiente de ${producto.codigo}: hay ${producto.existencia} y se pidieron ${datos.cantidad}.`,
      [{ productoId: producto.id, codigo: producto.codigo, existencia: producto.existencia, solicitada: datos.cantidad }],
    );
  }

  const id = await movimientosRepo.insertar(
    {
      productoId: datos.productoId,
      usuarioId: datos.usuarioId,
      facturaId: datos.facturaId ?? null,
      tipo: datos.tipo,
      cantidad: delta,
      existenciaResultante,
      motivo: datos.motivo,
      observacion: datos.observacion ?? null,
      fecha: new Date(),
    },
    tx,
  );
  return (await movimientosRepo.buscarPorId(id, tx))!;
}

// RF-P4 (ingreso) y RF-P5 (egreso): movimiento manual, solo admin (sección 3).
// El rol va primero: un vendedor recibe 403 aunque mande datos inválidos (lista de control 10.8, punto 2).
// Un egreso que dejaría la existencia en negativo responde 409 STOCK_INSUFICIENTE.
export async function registrarMovimientoManual(
  actor: UsuarioSesion,
  productoId: number,
  datos: unknown,
): Promise<MovimientoStockPublico> {
  exigirRol(actor, "admin");
  const { tipo, cantidad, motivo, observacion } = validar(movimientoManualSchema, datos);

  const movimiento = await db.transaction((tx) =>
    moverStock(tx, { productoId, usuarioId: actor.id, tipo, cantidad, motivo, observacion }),
  );
  return aPublico(movimiento);
}

// RF-P6: historial de un producto, del más nuevo al más viejo. Ambos roles.
export async function listarMovimientosProducto(
  actor: UsuarioSesion,
  productoId: number,
  filtros: unknown,
): Promise<Pagina<MovimientoStockPublico>> {
  const { page, pageSize } = validar(filtrosMovimientosProductoSchema, filtros);
  exigirRol(actor, "admin", "vendedor");

  if (!(await productosRepo.buscarExistencia(productoId))) throw errores.noEncontrado("El producto");

  const { filas, total } = await movimientosRepo.listar({
    productoId,
    limite: pageSize,
    desplazamiento: (page - 1) * pageSize,
  });
  return { data: filas.map(aPublico), page, pageSize, total };
}

// RF-P6: movimientos de todos los productos con filtros productoId, tipo, desde y hasta. Ambos roles.
export async function listarMovimientos(
  actor: UsuarioSesion,
  filtros: unknown,
): Promise<Pagina<MovimientoStockPublico>> {
  const { page, pageSize, ...resto } = validar(filtrosMovimientosSchema, filtros);
  exigirRol(actor, "admin", "vendedor");

  const { filas, total } = await movimientosRepo.listar({
    ...resto,
    limite: pageSize,
    desplazamiento: (page - 1) * pageSize,
  });
  return { data: filas.map(aPublico), page, pageSize, total };
}
