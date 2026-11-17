// Servicio de clientes y cuenta corriente (sección 10.2). Admin y vendedor pueden operar clientes (sección 3).
// Orden de cada función: valida con el esquema, verifica el rol, aplica las reglas y devuelve la forma pública.
import "server-only";
import { db, type Ejecutor } from "@/db";
import { exigirRol, type UsuarioSesion } from "@/lib/auth/permisos";
import type { EstadoFactura, FormaPago, TipoMovimientoCuenta } from "@/lib/constants";
import { ApiError, errores } from "@/lib/errors";
import { formatearNumeroComprobante } from "@/lib/format";
import { finDelDiaArgentina, inicioDelDiaArgentina } from "@/lib/schemas/comun";
import {
  crearClienteSchema,
  editarClienteSchema,
  filtrosClientesSchema,
  filtrosCuentaSchema,
  mensajeDocumentoInvalido,
  normalizarDocumento,
  normalizarParaBusqueda,
} from "@/lib/schemas/clientes";
import type { Pagina } from "@/lib/schemas/comun";
import { validar } from "@/lib/schemas/validar";
import * as clientesRepo from "@/repositories/clientes.repository";
import * as facturasRepo from "@/repositories/facturas.repository";
import type { ClienteConSaldoFila } from "@/repositories/clientes.repository";
import * as movimientosRepo from "@/repositories/movimientos-cuenta.repository";

// ---------- Formas públicas (sección 11.5) ----------

// `limiteCredito` y `disponible` valen null cuando el cliente no tiene límite.
export type ClientePublico = ClienteConSaldoFila & { disponible: number | null };

// Resumen de factura para la ficha (RF-C3).
export type FacturaResumen = {
  id: number;
  numeroFormateado: string;
  fecha: string;
  forma: FormaPago;
  estado: EstadoFactura;
  total: number;
};

// Cantidad de facturas que muestra la ficha.
const ULTIMAS_FACTURAS = 6;

export type ClienteDetalle = ClientePublico & { ultimasFacturas: FacturaResumen[] };

export type MovimientoCuentaPublico = {
  fecha: string;
  tipo: TipoMovimientoCuenta;
  importe: number;
  descripcion: string;
  facturaId: number | null;
  pagoId: number | null;
  // Saldo acumulado después de este movimiento.
  saldo: number;
};

export type CuentaCorriente = {
  cliente: { id: number; nombre: string };
  saldoAnterior: number;
  movimientos: MovimientoCuentaPublico[];
  saldo: number;
};

export type PaginaClientes = Pagina<ClientePublico> & { totalAdeudado?: number };

// Regla 7: disponible = límite − saldo.
function aPublico(fila: ClienteConSaldoFila): ClientePublico {
  return { ...fila, disponible: fila.limiteCredito === null ? null : fila.limiteCredito - fila.saldo };
}

function errorDocumentoDuplicado() {
  return new ApiError(409, "DOCUMENTO_DUPLICADO", "Ya existe un cliente con ese documento.", [
    { campo: "nroDoc", mensaje: "Ya existe un cliente con ese documento." },
  ]);
}

function errorDeCampo(campo: string, mensaje: string) {
  return new ApiError(422, "VALIDACION", "Hay campos con errores.", [{ campo, mensaje }]);
}

// Si dos altas simultáneas pasan la verificación previa, la segunda choca con el UNIQUE de la base:
// se informa igual como DOCUMENTO_DUPLICADO en vez de un 500.
function esDocumentoDuplicadoEnBase(error: unknown): boolean {
  const texto = String((error as { cause?: unknown })?.cause ?? error);
  return texto.includes("UNIQUE constraint failed: clientes.nro_doc_normalizado");
}

async function buscarOFallar(id: number, ejecutor: Ejecutor = db): Promise<ClienteConSaldoFila> {
  const fila = await clientesRepo.buscarPorId(id, ejecutor);
  if (!fila) throw errores.noEncontrado("El cliente");
  return fila;
}

// ---------- Operaciones ----------

// RF-C1 y RF-C6: listado paginado con el saldo de cada cliente. Búsqueda por nombre o documento sin importar
// mayúsculas, acentos, puntos ni guiones. Con conDeuda=true: solo saldo > 0, de mayor a menor, y totalAdeudado.
export async function listarClientes(actor: UsuarioSesion, filtros: unknown): Promise<PaginaClientes> {
  const { q, conDeuda, orden, activo, page, pageSize } = validar(filtrosClientesSchema, filtros);
  exigirRol(actor, "admin", "vendedor");

  const qNormalizado = q ? normalizarParaBusqueda(q) || undefined : undefined;
  const { filas, total, totalSaldos } = await clientesRepo.listar({
    qNormalizado,
    conDeuda,
    activo,
    orden,
    limite: pageSize,
    desplazamiento: (page - 1) * pageSize,
  });

  const pagina: PaginaClientes = { data: filas.map(aPublico), page, pageSize, total };
  if (conDeuda) pagina.totalAdeudado = totalSaldos;
  return pagina;
}

// RF-C3: ficha del cliente con saldo, disponible y últimas facturas.
export async function obtenerCliente(actor: UsuarioSesion, id: number): Promise<ClienteDetalle> {
  exigirRol(actor, "admin", "vendedor");
  const fila = await buscarOFallar(id);
  const facturas = await facturasRepo.ultimasDeCliente(id, ULTIMAS_FACTURAS);
  return {
    ...aPublico(fila),
    ultimasFacturas: facturas.map((factura) => ({
      id: factura.id,
      numeroFormateado: formatearNumeroComprobante(factura.puntoVenta, factura.numero),
      fecha: factura.fecha.toISOString(),
      forma: factura.forma,
      estado: factura.estado,
      total: factura.total,
    })),
  };
}

// RF-C2 (y RF-V2: alta rápida desde Nueva venta). Documento único (409 DOCUMENTO_DUPLICADO).
export async function crearCliente(actor: UsuarioSesion, datos: unknown): Promise<ClientePublico> {
  const cliente = validar(crearClienteSchema, datos);
  exigirRol(actor, "admin", "vendedor");

  // El esquema ya verificó que el documento es válido para su tipo.
  const documento = normalizarDocumento(cliente.tipoDoc, cliente.nroDoc)!;
  if (await clientesRepo.existeDocumento(documento.digitos)) throw errorDocumentoDuplicado();

  try {
    const id = await clientesRepo.insertar({
      tipoDoc: cliente.tipoDoc,
      nroDoc: documento.formateado,
      nroDocNormalizado: documento.digitos,
      nombre: cliente.nombre,
      nombreBusqueda: normalizarParaBusqueda(cliente.nombre),
      domicilio: cliente.domicilio ?? null,
      telefono: cliente.telefono ?? null,
      email: cliente.email ?? null,
      cuentaCorriente: cliente.cuentaCorriente ?? false,
      limiteCredito: cliente.limiteCredito ?? null,
      activo: true,
    });
    return aPublico(await buscarOFallar(id));
  } catch (error) {
    if (esDocumentoDuplicadoEnBase(error)) throw errorDocumentoDuplicado();
    throw error;
  }
}

// RF-C2 y RF-C7: edición parcial y baja lógica (regla 12: nunca se borra).
// 422 SALDO_PENDIENTE si se desactiva o se le quita la cuenta corriente con saldo distinto de cero.
export async function editarCliente(actor: UsuarioSesion, id: number, datos: unknown): Promise<ClientePublico> {
  const cambios = validar(editarClienteSchema, datos);
  exigirRol(actor, "admin", "vendedor");

  try {
    return await db.transaction(async (tx) => {
      const actual = await buscarOFallar(id, tx);
      if (Object.keys(cambios).length === 0) return aPublico(actual);

      const { tipoDoc, nroDoc, ...resto } = cambios;
      const actualizacion: Parameters<typeof clientesRepo.actualizar>[1] = { ...resto };

      // El documento se valida con su tipo resultante: puede cambiar uno solo de los dos.
      if (tipoDoc !== undefined || nroDoc !== undefined) {
        const tipoFinal = tipoDoc ?? actual.tipoDoc;
        const documento = normalizarDocumento(tipoFinal, nroDoc ?? actual.nroDoc);
        if (!documento) throw errorDeCampo("nroDoc", mensajeDocumentoInvalido(tipoFinal));
        if (await clientesRepo.existeDocumento(documento.digitos, id, tx)) throw errorDocumentoDuplicado();
        Object.assign(actualizacion, {
          tipoDoc: tipoFinal,
          nroDoc: documento.formateado,
          nroDocNormalizado: documento.digitos,
        });
      }

      if (cambios.nombre !== undefined) actualizacion.nombreBusqueda = normalizarParaBusqueda(cambios.nombre);

      // RF-C7, regla 12: un cliente con saldo no se da de baja ni pierde la cuenta corriente.
      const seDesactiva = cambios.activo === false && actual.activo;
      const pierdeCuenta = cambios.cuentaCorriente === false && actual.cuentaCorriente;
      if ((seDesactiva || pierdeCuenta) && actual.saldo !== 0) {
        throw new ApiError(
          422,
          "SALDO_PENDIENTE",
          seDesactiva
            ? "No se puede dar de baja un cliente con saldo pendiente."
            : "No se puede quitar la cuenta corriente a un cliente con saldo pendiente.",
          { saldo: actual.saldo },
        );
      }

      // El límite de crédito solo aplica con cuenta corriente: si queda sin cuenta, el límite se borra.
      const cuentaFinal = cambios.cuentaCorriente ?? actual.cuentaCorriente;
      if (!cuentaFinal) {
        if (cambios.limiteCredito != null) {
          throw errorDeCampo("limiteCredito", "El límite de crédito solo aplica a clientes con cuenta corriente.");
        }
        actualizacion.limiteCredito = null;
      }

      await clientesRepo.actualizar(id, actualizacion, tx);
      return aPublico(await buscarOFallar(id, tx));
    });
  } catch (error) {
    if (esDocumentoDuplicadoEnBase(error)) throw errorDocumentoDuplicado();
    throw error;
  }
}

// RF-C4: movimientos en orden cronológico con el saldo acumulado en cada renglón.
// `desde` y `hasta` (AAAA-MM-DD) son días en hora de Argentina; si `desde` corta el historial,
// `saldoAnterior` trae lo acumulado antes de ese día. `saldo` es el del último renglón mostrado.
export async function obtenerCuentaCorriente(actor: UsuarioSesion, id: number, filtros: unknown): Promise<CuentaCorriente> {
  const { desde, hasta } = validar(filtrosCuentaSchema, filtros);
  exigirRol(actor, "admin", "vendedor");

  const cliente = await buscarOFallar(id);
  const inicio = desde ? inicioDelDiaArgentina(desde) : undefined;

  const [saldoAnterior, filas] = await Promise.all([
    inicio ? movimientosRepo.sumarSaldo(id, { antesDe: inicio }) : Promise.resolve(0),
    movimientosRepo.listarDeCliente(id, { desde: inicio, hastaExclusivo: hasta ? finDelDiaArgentina(hasta) : undefined }),
  ]);

  let acumulado = saldoAnterior;
  const movimientos = filas.map((fila): MovimientoCuentaPublico => {
    acumulado += fila.tipo === "debito" ? fila.importe : -fila.importe;
    return {
      fecha: fila.fecha.toISOString(),
      tipo: fila.tipo,
      importe: fila.importe,
      descripcion: fila.descripcion,
      facturaId: fila.facturaId,
      pagoId: fila.pagoId,
      saldo: acumulado,
    };
  });

  return { cliente: { id: cliente.id, nombre: cliente.nombre }, saldoAnterior, movimientos, saldo: acumulado };
}

// ---------- Para otros servicios (pagos y, en el hito 3, facturas) ----------
// Sin actor ni validación propia: los llama un servicio que ya validó y abrió la transacción.

// Regla 7: saldo = Σ débitos − Σ créditos. Única fuente del saldo del cliente.
export function saldoDeCliente(clienteId: number, ejecutor: Ejecutor = db): Promise<number> {
  return movimientosRepo.sumarSaldo(clienteId, {}, ejecutor);
}

// Graba un débito (venta a cuenta) o un crédito (pago o anulación). Siempre dentro de la transacción
// de la operación que lo origina, para que el saldo y su origen se graben juntos (regla 7, RF-V6, RF-C5).
export async function registrarMovimientoCuenta(
  datos: {
    clienteId: number;
    tipo: TipoMovimientoCuenta;
    importe: number;
    descripcion: string;
    fecha: Date;
    facturaId?: number | null;
    pagoId?: number | null;
  },
  tx: Ejecutor,
): Promise<void> {
  await movimientosRepo.insertar(
    { ...datos, facturaId: datos.facturaId ?? null, pagoId: datos.pagoId ?? null },
    tx,
  );
}
