// Servicio de facturas (sección 10.2; RF-V1 a RF-V9). Admin y vendedor facturan; solo el admin anula (sección 3).
// Orden de cada función: valida con el esquema, verifica el rol, aplica las reglas y devuelve la forma pública.
import "server-only";
import { db, type Ejecutor } from "@/db";
import { exigirRol, type UsuarioSesion } from "@/lib/auth/permisos";
import {
  PUNTO_VENTA_FACTURAS,
  type EstadoFactura,
  type FormaPago,
  type TipoDoc,
  type TipoTarjeta,
} from "@/lib/constants";
import { ApiError, errores } from "@/lib/errors";
import { formatearMoneda, formatearNumeroComprobante } from "@/lib/format";
import { normalizarParaBusqueda } from "@/lib/schemas/clientes";
import type { Pagina } from "@/lib/schemas/comun";
import { anularFacturaSchema, emitirFacturaSchema, filtrosFacturasSchema } from "@/lib/schemas/facturas";
import { validar } from "@/lib/schemas/validar";
import * as clientesRepo from "@/repositories/clientes.repository";
import * as facturasRepo from "@/repositories/facturas.repository";
import type { FacturaConDatosFila } from "@/repositories/facturas.repository";
import * as numeradoresRepo from "@/repositories/numeradores.repository";
import { registrarMovimientoCuenta, saldoDeCliente } from "./clientes.service";
import { moverStock } from "./stock.service";

// Serie de la numeración de facturas en la tabla numeradores (regla 4).
const SERIE_FACTURAS = `factura-${String(PUNTO_VENTA_FACTURAS).padStart(4, "0")}`;

// ---------- Formas públicas (sección 11.6) ----------

export type PagoFactura =
  | { forma: "contado"; montoRecibido: number; vuelto: number }
  | { forma: "tarjeta"; tarjeta: { tipo: TipoTarjeta; marca: string; ultimos4: string } }
  | { forma: "cuenta_corriente" };

export type FacturaPublica = {
  id: number;
  puntoVenta: number;
  numero: number;
  numeroFormateado: string;
  fecha: string;
  estado: EstadoFactura;
  cliente: { id: number; nombre: string; tipoDoc: TipoDoc; nroDoc: string; domicilio: string | null } | null;
  vendedor: { id: number; nombre: string };
  items: {
    productoId: number;
    codigo: string;
    descripcion: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
  }[];
  total: number;
  pago: PagoFactura;
  // Solo en ventas a cuenta corriente: el saldo actual del cliente.
  saldoCliente?: number;
  // Solo si está anulada (RF-V9).
  anulacion?: { fecha: string; usuario: { id: number; nombre: string }; motivo: string };
};

export type FacturaResumenPublica = {
  id: number;
  puntoVenta: number;
  numero: number;
  numeroFormateado: string;
  fecha: string;
  estado: EstadoFactura;
  forma: FormaPago;
  total: number;
  cliente: { id: number; nombre: string } | null;
  vendedor: { id: number; nombre: string };
};

export type PaginaFacturas = Pagina<FacturaResumenPublica> & { totalEmitido: number };

function pagoPublico({ factura }: FacturaConDatosFila): PagoFactura {
  if (factura.forma === "contado") {
    const montoRecibido = factura.montoRecibido ?? factura.total;
    return { forma: "contado", montoRecibido, vuelto: montoRecibido - factura.total };
  }
  if (factura.forma === "tarjeta") {
    return {
      forma: "tarjeta",
      tarjeta: { tipo: factura.tarjetaTipo!, marca: factura.tarjetaMarca!, ultimos4: factura.tarjetaUltimos4! },
    };
  }
  return { forma: "cuenta_corriente" };
}

// Arma la factura completa desde la base (renglones con la descripción y el precio congelados, regla 3).
async function facturaPublica(id: number, ejecutor: Ejecutor = db): Promise<FacturaPublica> {
  const fila = await facturasRepo.buscarPorId(id, ejecutor);
  if (!fila) throw errores.noEncontrado("La factura");
  const { factura, cliente, vendedor } = fila;
  const items = await facturasRepo.itemsDeFactura(id, ejecutor);

  const publica: FacturaPublica = {
    id: factura.id,
    puntoVenta: factura.puntoVenta,
    numero: factura.numero,
    numeroFormateado: formatearNumeroComprobante(factura.puntoVenta, factura.numero),
    fecha: factura.fecha.toISOString(),
    estado: factura.estado,
    cliente,
    vendedor,
    items: items.map(({ productoId, codigo, descripcion, cantidad, precioUnitario, subtotal }) => ({
      productoId,
      codigo,
      descripcion,
      cantidad,
      precioUnitario,
      subtotal,
    })),
    total: factura.total,
    pago: pagoPublico(fila),
  };
  if (factura.forma === "cuenta_corriente" && factura.clienteId !== null) {
    publica.saldoCliente = await saldoDeCliente(factura.clienteId, ejecutor);
  }
  if (factura.estado === "anulada" && fila.anulador && factura.anuladaEn) {
    publica.anulacion = { fecha: factura.anuladaEn.toISOString(), usuario: fila.anulador, motivo: factura.motivoAnulacion ?? "" };
  }
  return publica;
}

function aResumen(fila: facturasRepo.FacturaListadoFila): FacturaResumenPublica {
  return {
    ...fila,
    numeroFormateado: formatearNumeroComprobante(fila.puntoVenta, fila.numero),
    fecha: fila.fecha.toISOString(),
  };
}

// ---------- Operaciones ----------

// RF-V1 a RF-V6: emite una factura. Todo en UNA transacción (sección 11.6, pasos 1 a 9): o se graban factura,
// renglones, stock y cuenta corriente, o no se graba nada. La transacción de libSQL empieza con BEGIN IMMEDIATE,
// y además moverStock() descuenta con un UPDATE condicional: dos ventas de la última unidad nunca pasan las dos
// (regla 1, lista de control 10.8).
export async function emitirFactura(actor: UsuarioSesion, datos: unknown): Promise<FacturaPublica> {
  const { clienteId, items, pago } = validar(emitirFacturaSchema, datos);
  exigirRol(actor, "admin", "vendedor");

  return db.transaction(async (tx) => {
    // 1. Los productos existen y están activos.
    const productos = await facturasRepo.productosPorIds(
      items.map((item) => item.productoId),
      tx,
    );
    const porId = new Map(productos.map((producto) => [producto.id, producto]));
    const faltante = items.find((item) => !porId.has(item.productoId));
    if (faltante) throw errores.noEncontrado("El producto");

    const inactivos = productos.filter((producto) => !producto.activo);
    if (inactivos.length > 0) {
      throw new ApiError(
        422,
        "PRODUCTO_INACTIVO",
        inactivos.length === 1
          ? `${inactivos[0].codigo} está dado de baja y no se puede vender.`
          : "Hay productos dados de baja que no se pueden vender.",
        inactivos.map((producto) => ({ productoId: producto.id, codigo: producto.codigo })),
      );
    }

    // 2. El cliente está activo y, si el pago es a cuenta, la tiene habilitada (regla 6).
    const cliente = clienteId === null ? null : await clientesRepo.buscarPorId(clienteId, tx);
    if (clienteId !== null && !cliente) throw errores.noEncontrado("El cliente");
    if (cliente && !cliente.activo) {
      throw new ApiError(422, "VALIDACION", "Hay campos con errores.", [
        { campo: "clienteId", mensaje: "El cliente está dado de baja." },
      ]);
    }
    if (pago.forma === "cuenta_corriente" && !cliente?.cuentaCorriente) {
      throw new ApiError(
        422,
        "CUENTA_CORRIENTE_NO_HABILITADA",
        cliente
          ? `${cliente.nombre} no tiene la cuenta corriente habilitada.`
          : "Consumidor final no puede comprar en cuenta corriente: seleccioná un cliente registrado.",
      );
    }

    // 3. La existencia alcanza para cada renglón (RF-V4). Se informan todos los que fallan juntos.
    const sinStock = items
      .map((item) => ({ item, producto: porId.get(item.productoId)! }))
      .filter(({ item, producto }) => producto.existencia < item.cantidad);
    if (sinStock.length > 0) {
      throw new ApiError(
        409,
        "STOCK_INSUFICIENTE",
        sinStock.length === 1
          ? `No hay stock suficiente de ${sinStock[0].producto.descripcion}: hay ${sinStock[0].producto.existencia}.`
          : "No hay stock suficiente de algunos productos.",
        sinStock.map(({ item, producto }) => ({
          productoId: producto.id,
          solicitado: item.cantidad,
          disponible: producto.existencia,
        })),
      );
    }

    // 4. Precio actual del catálogo, subtotales y total (el navegador no manda precios, sección 11.1).
    const renglones = items.map((item) => {
      const producto = porId.get(item.productoId)!;
      return {
        productoId: producto.id,
        codigo: producto.codigo,
        descripcion: producto.descripcion,
        cantidad: item.cantidad,
        precioUnitario: producto.precio,
        subtotal: item.cantidad * producto.precio,
      };
    });
    const total = renglones.reduce((suma, renglon) => suma + renglon.subtotal, 0);
    if (!Number.isSafeInteger(total)) {
      throw new ApiError(422, "VALIDACION", "El total de la factura es demasiado alto.", [
        { campo: "items", mensaje: "El total de la factura es demasiado alto." },
      ]);
    }

    // 5. Contado: el monto recibido cubre el total. Cuenta corriente: el saldo nuevo no supera el límite (regla 7).
    let montoRecibido: number | null = null;
    if (pago.forma === "contado") {
      montoRecibido = pago.montoRecibido ?? total;
      if (montoRecibido < total) {
        throw new ApiError(
          422,
          "MONTO_INSUFICIENTE",
          `El monto recibido (${formatearMoneda(montoRecibido)}) no cubre el total (${formatearMoneda(total)}).`,
          [{ campo: "pago.montoRecibido", mensaje: `Tiene que cubrir el total de ${formatearMoneda(total)}.` }],
        );
      }
    }
    if (pago.forma === "cuenta_corriente" && cliente && cliente.limiteCredito !== null) {
      const saldoActual = await saldoDeCliente(cliente.id, tx);
      const excedente = saldoActual + total - cliente.limiteCredito;
      if (excedente > 0) {
        throw new ApiError(
          422,
          "LIMITE_CREDITO_EXCEDIDO",
          `La venta supera el límite de crédito de ${cliente.nombre} por ${formatearMoneda(excedente)}.`,
          { saldoActual, limite: cliente.limiteCredito, excedente },
        );
      }
    }

    // 6. Número correlativo, asignado recién al confirmar (regla 4).
    const numero = await numeradoresRepo.siguienteNumero(SERIE_FACTURAS, tx);
    const numeroFormateado = formatearNumeroComprobante(PUNTO_VENTA_FACTURAS, numero);
    const fecha = new Date();

    // 7. Factura y renglones, con descripción y precio copiados del catálogo (regla 3).
    const factura = await facturasRepo.insertar(
      {
        puntoVenta: PUNTO_VENTA_FACTURAS,
        numero,
        fecha,
        total,
        forma: pago.forma,
        tarjetaTipo: pago.forma === "tarjeta" ? pago.tarjeta.tipo : null,
        tarjetaMarca: pago.forma === "tarjeta" ? pago.tarjeta.marca : null,
        tarjetaUltimos4: pago.forma === "tarjeta" ? pago.tarjeta.ultimos4 : null,
        montoRecibido,
        clienteId: cliente?.id ?? null,
        usuarioId: actor.id,
      },
      tx,
    );
    await facturasRepo.insertarItems(
      renglones.map((renglon) => ({ ...renglon, facturaId: factura.id })),
      tx,
    );

    // 8. Descuenta la existencia y graba un movimiento de venta por renglón (regla 2).
    for (const renglon of renglones) {
      await moverStock(tx, {
        productoId: renglon.productoId,
        usuarioId: actor.id,
        tipo: "venta",
        cantidad: renglon.cantidad,
        motivo: `Venta ${numeroFormateado}`,
        facturaId: factura.id,
      });
    }

    // 9. Venta a cuenta: el débito en la cuenta del cliente (regla 7).
    if (pago.forma === "cuenta_corriente" && cliente) {
      await registrarMovimientoCuenta(
        { clienteId: cliente.id, tipo: "debito", importe: total, descripcion: `Factura ${numeroFormateado}`, fecha, facturaId: factura.id },
        tx,
      );
    }

    return facturaPublica(factura.id, tx);
  });
}

// RF-V7: la factura completa, para el comprobante. Ambos roles.
export async function obtenerFactura(actor: UsuarioSesion, id: number): Promise<FacturaPublica> {
  exigirRol(actor, "admin", "vendedor");
  return facturaPublica(id);
}

// RF-V8: listado paginado, de la más nueva a la más vieja, con totalEmitido. Ambos roles.
// q busca por número ("0001-00000067" o "67") o por nombre del cliente, sin importar acentos ni mayúsculas.
export async function listarFacturas(actor: UsuarioSesion, filtros: unknown): Promise<PaginaFacturas> {
  const { q, page, pageSize, ...resto } = validar(filtrosFacturasSchema, filtros);
  exigirRol(actor, "admin", "vendedor");

  let numero: { puntoVenta?: number; numero: number } | undefined;
  const completo = q?.match(/^(\d{1,4})-(\d{1,8})$/);
  if (completo) numero = { puntoVenta: Number(completo[1]), numero: Number(completo[2]) };
  else if (q && /^\d{1,8}$/.test(q)) numero = { numero: Number(q) };
  const nombreNormalizado = q && !completo ? normalizarParaBusqueda(q) || undefined : undefined;

  const { filas, total, totalEmitido } = await facturasRepo.listar({
    ...resto,
    numero,
    nombreNormalizado,
    limite: pageSize,
    desplazamiento: (page - 1) * pageSize,
  });
  return { data: filas.map(aResumen), page, pageSize, total, totalEmitido };
}

// RF-V1: el próximo número, solo informativo (el real se asigna al confirmar, regla 4). Ambos roles.
export async function proximoNumero(actor: UsuarioSesion): Promise<{ numeroFormateado: string }> {
  exigirRol(actor, "admin", "vendedor");
  const ultimo = await numeradoresRepo.ultimoNumero(SERIE_FACTURAS);
  return { numeroFormateado: formatearNumeroComprobante(PUNTO_VENTA_FACTURAS, ultimo + 1) };
}

// RF-V9: anula una factura. Solo admin: el rol va primero, así un vendedor recibe 403 aunque falte el motivo
// (lista de control 10.8). En una transacción: marca la factura como anulada, reingresa el stock de cada renglón
// con un movimiento de anulación y, si fue a cuenta corriente, acredita el total (regla 5). Nunca se borra.
export async function anularFactura(actor: UsuarioSesion, id: number, datos: unknown): Promise<FacturaPublica> {
  exigirRol(actor, "admin");
  const { motivo } = validar(anularFacturaSchema, datos);

  return db.transaction(async (tx) => {
    const fila = await facturasRepo.buscarPorId(id, tx);
    if (!fila) throw errores.noEncontrado("La factura");
    const { factura } = fila;
    const numeroFormateado = formatearNumeroComprobante(factura.puntoVenta, factura.numero);
    const errorAnulada = new ApiError(409, "FACTURA_ANULADA", `La factura ${numeroFormateado} ya estaba anulada.`);
    if (factura.estado === "anulada") throw errorAnulada;

    const fecha = new Date();
    // Si dos anulaciones llegan a la vez, solo una encuentra la factura emitida.
    if (!(await facturasRepo.marcarAnulada(id, { motivo, usuarioId: actor.id, fecha }, tx))) throw errorAnulada;

    for (const item of await facturasRepo.itemsDeFactura(id, tx)) {
      await moverStock(tx, {
        productoId: item.productoId,
        usuarioId: actor.id,
        tipo: "anulacion",
        cantidad: item.cantidad,
        motivo: `Anulación ${numeroFormateado}`,
        observacion: motivo,
        facturaId: id,
      });
    }

    if (factura.forma === "cuenta_corriente" && factura.clienteId !== null) {
      await registrarMovimientoCuenta(
        {
          clienteId: factura.clienteId,
          tipo: "credito",
          importe: factura.total,
          descripcion: `Anulación factura ${numeroFormateado}`,
          fecha,
          facturaId: id,
        },
        tx,
      );
    }

    return facturaPublica(id, tx);
  });
}

// RF-V8: vendedores para el filtro del listado. Ambos roles.
export async function listarVendedores(actor: UsuarioSesion): Promise<{ id: number; nombre: string }[]> {
  exigirRol(actor, "admin", "vendedor");
  return facturasRepo.vendedores();
}

