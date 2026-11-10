// Lógica de cuentas corrientes. Contrato: docs/02-api-rest.md (Cuenta corriente y pagos)
// Saldo = Σ ventas CUENTA_CORRIENTE − Σ pagos. Contado y tarjeta no generan deuda.
import { db } from "@/db";
import { TIPOS_MOVIMIENTO_CUENTA } from "@/lib/constants";
import { CODIGOS_ERROR, ErrorApi } from "@/lib/errors";
import * as clientesRepository from "@/repositories/clientes.repository";
import * as pagosRepository from "@/repositories/pagos.repository";
import { errorClienteNoEncontrado } from "./clientes.service";

// Más reciente primero. Con la misma fecha, el registro creado después va primero.
function compararPorFechaDescendente(a, b) {
  return b.fecha - a.fecha || b.orden - a.orden;
}

export async function obtenerCuentaCorriente(clienteId) {
  // Repeatable read: el saldo y los movimientos salen de la misma foto de la base.
  return db.transaction(
    async (tx) => {
      const cliente = await clientesRepository.obtenerClientePorId(clienteId, tx);
      if (!cliente) throw errorClienteNoEncontrado();

      const [ventas, pagos] = await Promise.all([
        clientesRepository.listarVentasEnCuentaCorriente(clienteId, tx),
        pagosRepository.listarPagosDeCliente(clienteId, tx),
      ]);

      // Importes siempre positivos: `tipo` indica si suma (VENTA) o resta (PAGO).
      const movimientos = [
        ...ventas.map((venta) => ({
          tipo: TIPOS_MOVIMIENTO_CUENTA.VENTA,
          fecha: venta.fecha,
          ventaId: venta.id,
          numeroComprobante: venta.numero,
          importeCentavos: venta.totalCentavos,
          orden: venta.id,
        })),
        ...pagos.map((pago) => ({
          tipo: TIPOS_MOVIMIENTO_CUENTA.PAGO,
          fecha: pago.fecha,
          pagoId: pago.id,
          importeCentavos: pago.importeCentavos,
          observacion: pago.observacion,
          orden: pago.id,
        })),
      ]
        .sort(compararPorFechaDescendente)
        .map(({ orden, ...movimiento }) => movimiento);

      return { clienteId, saldoCentavos: cliente.saldoCentavos, movimientos };
    },
    { isolationLevel: "repeatable read", accessMode: "read only" },
  );
}

export async function registrarPago(clienteId, { fecha, importeCentavos, observacion }, usuario) {
  if (fecha > new Date()) {
    const mensaje = "La fecha del pago no puede ser futura.";
    throw new ErrorApi(422, CODIGOS_ERROR.VALIDACION, mensaje, { errores: [{ campo: "fecha", mensaje }] });
  }

  return db.transaction(async (tx) => {
    // Bloquea al cliente: otro pago simultáneo espera acá y después ve este pago en el saldo.
    const bloqueado = await clientesRepository.bloquearCliente(clienteId, tx);
    if (!bloqueado) throw errorClienteNoEncontrado();

    const { saldoCentavos } = await clientesRepository.obtenerClientePorId(clienteId, tx);
    if (importeCentavos > saldoCentavos) {
      throw new ErrorApi(409, CODIGOS_ERROR.PAGO_SUPERA_SALDO, "El importe supera el saldo adeudado del cliente.", {
        saldoCentavos,
        importeCentavos,
      });
    }

    const pago = await pagosRepository.crearPago(
      { clienteId, usuarioId: usuario.id, fecha, importeCentavos, observacion },
      tx,
    );
    return { pago, saldoCentavos: saldoCentavos - importeCentavos };
  });
}
