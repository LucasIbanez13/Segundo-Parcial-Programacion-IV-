// Lógica de ventas. Contrato: docs/02-api-rest.md (Ventas y comprobantes)
// La deuda en cuenta corriente es la propia venta: no se inserta nada más para el cliente.
import { db } from "@/db";
import { CONSUMIDOR_FINAL, ORIGENES_MOVIMIENTO, TIPOS_MOVIMIENTO } from "@/lib/constants";
import { CODIGOS_ERROR, ErrorApi } from "@/lib/errors";
import { MAXIMO_ENTERO_BD } from "@/lib/validations/comun";
import * as clientesRepository from "@/repositories/clientes.repository";
import * as movimientosRepository from "@/repositories/movimientosStock.repository";
import * as ventasRepository from "@/repositories/ventas.repository";

function errorVentaNoEncontrada() {
  return new ErrorApi(404, CODIGOS_ERROR.NO_ENCONTRADO, "La venta no existe.");
}

function errorStockInsuficiente(producto, solicitado) {
  return new ErrorApi(409, CODIGOS_ERROR.STOCK_INSUFICIENTE, `No hay stock suficiente para ${producto.nombre}.`, {
    productoId: producto.id,
    disponible: producto.stockActual,
    solicitado,
  });
}

// Un renglón por producto: los repetidos se suman. Se ordena por id para bloquear siempre en el mismo orden.
function agruparProductos(productos) {
  const cantidades = new Map();
  for (const { productoId, cantidad } of productos) {
    cantidades.set(productoId, (cantidades.get(productoId) ?? 0) + cantidad);
  }
  return [...cantidades]
    .map(([productoId, cantidad]) => ({ productoId, cantidad }))
    .sort((a, b) => a.productoId - b.productoId);
}

// Importes que no entran en la columna integer de la BD se rechazan con 422 en lugar de un 500.
function verificarImporte(centavos) {
  if (!Number.isSafeInteger(centavos) || centavos > MAXIMO_ENTERO_BD) {
    throw new ErrorApi(422, CODIGOS_ERROR.VALIDACION, "El importe de la venta supera el máximo permitido.");
  }
}

async function copiarDatosDelCliente(clienteId, tx) {
  if (clienteId === null) return { clienteNombre: CONSUMIDOR_FINAL, clienteDocumento: null };

  const cliente = await clientesRepository.obtenerClientePorId(clienteId, tx);
  if (!cliente) throw new ErrorApi(404, CODIGOS_ERROR.NO_ENCONTRADO, "El cliente no existe.", { clienteId });
  return { clienteNombre: cliente.nombre, clienteDocumento: cliente.documento };
}

// Verifica existencia (404), estado (409) y stock (409) con los productos ya bloqueados.
// Devuelve los renglones con el precio vigente de la BD: lo que mande el navegador se ignora.
function armarDetalles(pedidos, productos) {
  const porId = new Map(productos.map((producto) => [producto.id, producto]));

  return pedidos.map(({ productoId, cantidad }) => {
    const producto = porId.get(productoId);
    if (!producto) {
      throw new ErrorApi(404, CODIGOS_ERROR.NO_ENCONTRADO, "Uno de los productos de la venta no existe.", {
        productoId,
      });
    }
    if (!producto.activo) {
      throw new ErrorApi(
        409,
        CODIGOS_ERROR.PRODUCTO_INACTIVO,
        `${producto.nombre} está inactivo y no se puede vender.`,
        { productoId },
      );
    }
    if (producto.stockActual < cantidad) throw errorStockInsuficiente(producto, cantidad);

    const subtotalCentavos = cantidad * producto.precioVentaCentavos;
    verificarImporte(subtotalCentavos);
    return {
      productoId,
      descripcion: producto.nombre,
      cantidad,
      precioUnitarioCentavos: producto.precioVentaCentavos,
      subtotalCentavos,
      producto,
    };
  });
}

// Formato de GET /api/ventas/:id, armado solo con las copias históricas.
function armarComprobante(venta, productos) {
  return {
    id: venta.id,
    numero: venta.numero,
    fecha: venta.fecha,
    usuarioId: venta.usuarioId,
    clienteId: venta.clienteId,
    clienteNombre: venta.clienteNombre,
    clienteDocumento: venta.clienteDocumento,
    formaPago: venta.formaPago,
    productos,
    totalCentavos: venta.totalCentavos,
  };
}

export function listarVentas() {
  return ventasRepository.listarVentas();
}

export async function obtenerVenta(id) {
  const venta = await ventasRepository.obtenerVentaPorId(id);
  if (!venta) throw errorVentaNoEncontrada();
  return armarComprobante(venta, await ventasRepository.listarDetallesDeVenta(id));
}

// Todo en UNA transacción: venta + detalles + descuento de stock + movimientos.
// Cualquier error hace rollback y no queda nada registrado (ni stock descontado ni deuda).
export async function registrarVenta({ clienteId, formaPago, productos }, usuario) {
  const pedidos = agruparProductos(productos);

  return db.transaction(async (tx) => {
    const datosCliente = await copiarDatosDelCliente(clienteId, tx);

    const bloqueados = await ventasRepository.bloquearProductos(
      pedidos.map((pedido) => pedido.productoId),
      tx,
    );
    const detalles = armarDetalles(pedidos, bloqueados);

    const totalCentavos = detalles.reduce((suma, detalle) => suma + detalle.subtotalCentavos, 0);
    verificarImporte(totalCentavos);

    const venta = await ventasRepository.crearVenta(
      { clienteId, usuarioId: usuario.id, formaPago, totalCentavos, ...datosCliente },
      tx,
    );

    const guardados = await ventasRepository.crearDetalles(
      detalles.map(({ producto, ...detalle }) => ({ ...detalle, ventaId: venta.id })),
      tx,
    );

    for (const detalle of guardados) {
      // UPDATE condicional (stock_actual >= cantidad): aunque los productos ya estén bloqueados,
      // es la garantía final de que el stock no queda negativo.
      const actualizado = await movimientosRepository.descontarStock(detalle.productoId, detalle.cantidad, tx);
      if (!actualizado) {
        const producto = detalles.find((actual) => actual.productoId === detalle.productoId).producto;
        throw errorStockInsuficiente(producto, detalle.cantidad);
      }

      await movimientosRepository.crearMovimiento(
        {
          productoId: detalle.productoId,
          usuarioId: usuario.id,
          detalleVentaId: detalle.id,
          tipo: TIPOS_MOVIMIENTO.SALIDA,
          cantidad: detalle.cantidad,
          motivo: `Venta #${venta.numero}`,
          origen: ORIGENES_MOVIMIENTO.VENTA,
        },
        tx,
      );
    }

    return armarComprobante(
      venta,
      guardados.map(({ productoId, descripcion, cantidad, precioUnitarioCentavos, subtotalCentavos }) => ({
        productoId,
        descripcion,
        cantidad,
        precioUnitarioCentavos,
        subtotalCentavos,
      })),
    );
  });
}
