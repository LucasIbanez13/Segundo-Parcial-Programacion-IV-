// Lógica de productos. Contrato: docs/02-api-rest.md (Productos)
import { db } from "@/db";
import { ORIGENES_MOVIMIENTO, TIPOS_MOVIMIENTO, UMBRAL_STOCK_BAJO } from "@/lib/constants";
import { ErrorApi } from "@/lib/errors";
import * as movimientosRepository from "@/repositories/movimientosStock.repository";
import * as productosRepository from "@/repositories/productos.repository";

const CODIGO_PG_VIOLACION_UNICA = "23505";
const DIAS_MOVIMIENTOS_RECIENTES = 7;

function errorCodigoDuplicado(codigo) {
  return new ErrorApi(409, "CODIGO_DUPLICADO", `Ya existe un producto con el código ${codigo}.`, { codigo });
}

function errorProductoNoEncontrado() {
  return new ErrorApi(404, "NO_ENCONTRADO", "El producto no existe.");
}

// La verificación previa da un error claro en el caso común, pero dos altas simultáneas
// pueden pasarla a la vez. En ese caso la que pierde choca con el índice único de la BD.
function convertirErrorDeCodigo(error, codigo) {
  const codigoPg = error?.code ?? error?.cause?.code;
  return codigoPg === CODIGO_PG_VIOLACION_UNICA ? errorCodigoDuplicado(codigo) : error;
}

export function listarProductos(filtros) {
  return productosRepository.listarProductos(filtros);
}

export async function obtenerProducto(id) {
  const producto = await productosRepository.obtenerProductoPorId(id);
  if (!producto) throw errorProductoNoEncontrado();
  return producto;
}

export async function crearProducto({ stockInicial, ...datos }, usuario) {
  try {
    return await db.transaction(async (tx) => {
      const existente = await productosRepository.obtenerProductoPorCodigo(datos.codigo, {}, tx);
      if (existente) throw errorCodigoDuplicado(datos.codigo);

      const producto = await productosRepository.crearProducto({ ...datos, stockActual: stockInicial }, tx);

      // El stock inicial queda registrado para que stock_actual coincida con sus movimientos.
      if (stockInicial > 0) {
        await movimientosRepository.crearMovimiento(
          {
            productoId: producto.id,
            usuarioId: usuario.id,
            tipo: TIPOS_MOVIMIENTO.ENTRADA,
            cantidad: stockInicial,
            motivo: "Stock inicial",
            origen: ORIGENES_MOVIMIENTO.INICIAL,
          },
          tx,
        );
      }

      return producto;
    });
  } catch (error) {
    throw convertirErrorDeCodigo(error, datos.codigo);
  }
}

export async function actualizarProducto(id, cambios) {
  const actual = await obtenerProducto(id);

  // Un PATCH vacío es válido: no hay nada para actualizar.
  if (Object.keys(cambios).length === 0) return actual;

  if (cambios.codigo !== undefined) {
    const otro = await productosRepository.obtenerProductoPorCodigo(cambios.codigo, { excluirId: id });
    if (otro) throw errorCodigoDuplicado(cambios.codigo);
  }

  try {
    return await productosRepository.actualizarProducto(id, cambios);
  } catch (error) {
    throw convertirErrorDeCodigo(error, cambios.codigo);
  }
}

// Para la carga inicial de la pantalla de productos (no tiene endpoint en el contrato).
export function obtenerEstadisticasStock() {
  return productosRepository.obtenerEstadisticasStock({
    umbralStockBajo: UMBRAL_STOCK_BAJO,
    diasRecientes: DIAS_MOVIMIENTOS_RECIENTES,
  });
}
