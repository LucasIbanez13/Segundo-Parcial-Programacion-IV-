// Servicio de pagos de cuenta corriente (sección 10.2; RF-C5). Admin y vendedor registran pagos (sección 3).
// Orden de cada función: valida con el esquema, verifica el rol, aplica las reglas y devuelve la forma pública.
import "server-only";
import { db } from "@/db";
import { exigirRol, type UsuarioSesion } from "@/lib/auth/permisos";
import { ETIQUETAS_MEDIO_PAGO, PUNTO_VENTA_RECIBOS, type MedioPago, type TipoDoc } from "@/lib/constants";
import { ApiError, errores } from "@/lib/errors";
import { formatearMoneda, formatearNumeroRecibo } from "@/lib/format";
import { registrarPagoSchema } from "@/lib/schemas/clientes";
import { validar } from "@/lib/schemas/validar";
import * as clientesRepo from "@/repositories/clientes.repository";
import * as movimientosRepo from "@/repositories/movimientos-cuenta.repository";
import * as numeradoresRepo from "@/repositories/numeradores.repository";
import * as pagosRepo from "@/repositories/pagos.repository";
import { registrarMovimientoCuenta } from "./clientes.service";

// Forma pública del recibo (sección 11.5). Suma `observacion` y el documento del cliente, que el recibo imprime.
export type Recibo = {
  id: number;
  numeroRecibo: string;
  fecha: string;
  cliente: { id: number; nombre: string; tipoDoc: TipoDoc; nroDoc: string };
  importe: number;
  medio: MedioPago;
  observacion: string | null;
  usuario: { id: number; nombre: string };
  // Saldo que le quedó al cliente después de este pago.
  saldoCliente: number;
};

// RF-C5: registra un pago y su recibo. Todo en UNA transacción (sección 10.2):
// verifica la cuenta y el saldo, asigna el número de recibo, graba el pago y el crédito en la cuenta.
// La transacción de libSQL empieza con BEGIN IMMEDIATE: toma el bloqueo de escritura de entrada, así que
// dos pagos simultáneos no se mezclan y ninguno puede dejar un saldo a favor.
export async function registrarPago(actor: UsuarioSesion, clienteId: number, datos: unknown): Promise<Recibo> {
  const { importe, medio, observacion } = validar(registrarPagoSchema, datos);
  exigirRol(actor, "admin", "vendedor");

  return db.transaction(async (tx) => {
    const cliente = await clientesRepo.buscarPorId(clienteId, tx);
    if (!cliente) throw errores.noEncontrado("El cliente");

    if (!cliente.activo || !cliente.cuentaCorriente) {
      throw new ApiError(
        422,
        "CUENTA_CORRIENTE_NO_HABILITADA",
        cliente.activo ? "El cliente no tiene la cuenta corriente habilitada." : "El cliente está dado de baja.",
      );
    }

    // Regla 8: un pago no supera la deuda (no hay saldos a favor).
    if (importe > cliente.saldo) {
      const mensaje =
        cliente.saldo > 0
          ? `El pago supera la deuda del cliente (${formatearMoneda(cliente.saldo)}).`
          : "El cliente no tiene deuda.";
      throw new ApiError(422, "PAGO_SUPERA_DEUDA", mensaje, [{ campo: "importe", mensaje }]);
    }

    // Regla 4: numeración propia, correlativa y sin huecos, con la tabla numeradores (serie "recibo-0001").
    // Si la transacción falla, el incremento también se deshace.
    const numero = await numeradoresRepo.siguienteNumero(`recibo-${String(PUNTO_VENTA_RECIBOS).padStart(4, "0")}`, tx);
    const numeroRecibo = formatearNumeroRecibo(PUNTO_VENTA_RECIBOS, numero);
    const fecha = new Date();

    const pago = await pagosRepo.insertar(
      {
        puntoVenta: PUNTO_VENTA_RECIBOS,
        numero,
        fecha,
        importe,
        medio,
        observacion: observacion ?? null,
        clienteId,
        usuarioId: actor.id,
      },
      tx,
    );

    // Regla 7: el pago descuenta la deuda con un crédito en la cuenta corriente.
    await registrarMovimientoCuenta(
      { clienteId, tipo: "credito", importe, descripcion: `Recibo ${numeroRecibo} · ${ETIQUETAS_MEDIO_PAGO[medio]}`, fecha, pagoId: pago.id },
      tx,
    );

    return {
      id: pago.id,
      numeroRecibo,
      fecha: fecha.toISOString(),
      cliente: { id: cliente.id, nombre: cliente.nombre, tipoDoc: cliente.tipoDoc, nroDoc: cliente.nroDoc },
      importe,
      medio,
      observacion: pago.observacion,
      usuario: { id: actor.id, nombre: actor.nombre },
      saldoCliente: cliente.saldo - importe,
    };
  });
}

// RF-C5: el mismo recibo, para reimprimirlo. `saldoCliente` es el que quedó al registrar ese pago.
export async function obtenerRecibo(actor: UsuarioSesion, id: number): Promise<Recibo> {
  exigirRol(actor, "admin", "vendedor");

  const fila = await pagosRepo.buscarConDatos(id);
  if (!fila) throw errores.noEncontrado("El pago");

  const { pago, cliente, usuario } = fila;
  const movimientoId = await movimientosRepo.buscarIdPorPago(pago.id);
  const saldoCliente =
    movimientoId === null ? 0 : await movimientosRepo.sumarSaldo(pago.clienteId, { hastaId: movimientoId });

  return {
    id: pago.id,
    numeroRecibo: formatearNumeroRecibo(pago.puntoVenta, pago.numero),
    fecha: pago.fecha.toISOString(),
    cliente,
    importe: pago.importe,
    medio: pago.medio,
    observacion: pago.observacion,
    usuario,
    saldoCliente,
  };
}
