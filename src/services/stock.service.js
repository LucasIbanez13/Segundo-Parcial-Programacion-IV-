// Lógica de movimientos de stock. Contrato: docs/02-api-rest.md (Movimientos de stock)
import { db } from "@/db";
import { ORIGENES_MOVIMIENTO, TIPOS_MOVIMIENTO } from "@/lib/constants";
import { ErrorApi } from "@/lib/errors";
import * as movimientosRepository from "@/repositories/movimientosStock.repository";
import * as productosRepository from "@/repositories/productos.repository";

const CODIGO_PG_FUERA_DE_RANGO = "22003";

function errorProductoNoEncontrado() {
  return new ErrorApi(404, "NO_ENCONTRADO", "El producto no existe.");
}

export async function listarMovimientos({ productoId } = {}) {
  if (productoId !== undefined) {
    const producto = await productosRepository.obtenerProductoPorId(productoId);
    if (!producto) throw errorProductoNoEncontrado();
  }
  return movimientosRepository.listarMovimientos({ productoId });
}

async function aplicarEntrada(productoId, cantidad, tx) {
  const producto = await movimientosRepository.sumarStock(productoId, cantidad, tx);
  if (!producto) throw errorProductoNoEncontrado();
  return producto;
}

async function aplicarSalida(productoId, cantidad, tx) {
  const producto = await movimientosRepository.descontarStock(productoId, cantidad, tx);
  if (producto) return producto;

  // Sin filas afectadas: se distingue si el producto no existe o si no alcanzó el stock.
  const actual = await productosRepository.obtenerProductoPorId(productoId, tx);
  if (!actual) throw errorProductoNoEncontrado();

  throw new ErrorApi(409, "STOCK_INSUFICIENTE", `No hay stock suficiente para ${actual.nombre}.`, {
    productoId,
    disponible: actual.stockActual,
    solicitado: cantidad,
  });
}

// Stock y movimiento se guardan juntos: si algo falla, la transacción no deja ninguno de los dos.
// Se permite sobre productos inactivos.
export async function registrarMovimiento({ productoId, tipo, cantidad, motivo }, usuario) {
  try {
    return await db.transaction(async (tx) => {
      const aplicar = tipo === TIPOS_MOVIMIENTO.ENTRADA ? aplicarEntrada : aplicarSalida;
      const producto = await aplicar(productoId, cantidad, tx);

      const movimiento = await movimientosRepository.crearMovimiento(
        { productoId, usuarioId: usuario.id, tipo, cantidad, motivo, origen: ORIGENES_MOVIMIENTO.MANUAL },
        tx,
      );

      return {
        movimiento: {
          id: movimiento.id,
          productoId: movimiento.productoId,
          productoNombre: producto.nombre,
          detalleVentaId: movimiento.detalleVentaId,
          tipo: movimiento.tipo,
          cantidad: movimiento.cantidad,
          motivo: movimiento.motivo,
          origen: movimiento.origen,
          ventaId: null,
          usuarioId: movimiento.usuarioId,
          fecha: movimiento.fecha,
        },
        stockActual: producto.stockActual,
      };
    });
  } catch (error) {
    // Una entrada puede ser válida por sí sola y aun así superar el máximo de la columna al sumarse.
    if ((error?.code ?? error?.cause?.code) === CODIGO_PG_FUERA_DE_RANGO) {
      throw new ErrorApi(422, "VALIDACION", "La cantidad hace que el stock supere el máximo permitido.");
    }
    throw error;
  }
}
