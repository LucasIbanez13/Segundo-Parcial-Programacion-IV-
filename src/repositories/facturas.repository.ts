// Acceso a datos de facturas y factura_items: solo consultas Drizzle, sin reglas de negocio.
// Todas aceptan un ejecutor opcional para participar de una transacción.
import "server-only";
import { aliasedTable, and, asc, count, desc, eq, gte, inArray, lt, or, sql, type SQL } from "drizzle-orm";
import { db, type Ejecutor } from "@/db";
import {
  clientes,
  facturaItems,
  facturas,
  productos,
  usuarios,
  type FacturaFila,
  type FacturaItemFila,
  type FacturaItemNuevo,
  type FacturaNueva,
} from "@/db/schema";
import type { EstadoFactura, FormaPago } from "@/lib/constants";

const anulador = aliasedTable(usuarios, "anulador");

// Lo que la venta necesita leer de cada producto: precio, existencia y si está activo.
export type ProductoParaFacturar = {
  id: number;
  codigo: string;
  descripcion: string;
  precio: number;
  existencia: number;
  activo: boolean;
};

export async function productosPorIds(ids: number[], ejecutor: Ejecutor = db): Promise<ProductoParaFacturar[]> {
  if (ids.length === 0) return [];
  return ejecutor
    .select({
      id: productos.id,
      codigo: productos.codigo,
      descripcion: productos.descripcion,
      precio: productos.precio,
      existencia: productos.existencia,
      activo: productos.activo,
    })
    .from(productos)
    .where(inArray(productos.id, ids));
}

export async function insertar(datos: FacturaNueva, ejecutor: Ejecutor = db): Promise<FacturaFila> {
  const [fila] = await ejecutor.insert(facturas).values(datos).returning();
  return fila;
}

export async function insertarItems(items: FacturaItemNuevo[], ejecutor: Ejecutor = db): Promise<FacturaItemFila[]> {
  return ejecutor.insert(facturaItems).values(items).returning();
}

// Factura con su cliente (si hay), su vendedor y quién la anuló (si está anulada).
export type FacturaConDatosFila = {
  factura: FacturaFila;
  cliente: { id: number; nombre: string; tipoDoc: "DNI" | "CUIT"; nroDoc: string; domicilio: string | null } | null;
  vendedor: { id: number; nombre: string };
  anulador: { id: number; nombre: string } | null;
};

export async function buscarPorId(id: number, ejecutor: Ejecutor = db): Promise<FacturaConDatosFila | null> {
  const [fila] = await ejecutor
    .select({
      factura: facturas,
      cliente: {
        id: clientes.id,
        nombre: clientes.nombre,
        tipoDoc: clientes.tipoDoc,
        nroDoc: clientes.nroDoc,
        domicilio: clientes.domicilio,
      },
      vendedor: { id: usuarios.id, nombre: usuarios.nombre },
      anulador: { id: anulador.id, nombre: anulador.nombre },
    })
    .from(facturas)
    .leftJoin(clientes, eq(facturas.clienteId, clientes.id))
    .innerJoin(usuarios, eq(facturas.usuarioId, usuarios.id))
    .leftJoin(anulador, eq(facturas.anuladaPorId, anulador.id))
    .where(eq(facturas.id, id))
    .limit(1);
  return fila ?? null;
}

export async function itemsDeFactura(facturaId: number, ejecutor: Ejecutor = db): Promise<FacturaItemFila[]> {
  return ejecutor.select().from(facturaItems).where(eq(facturaItems.facturaId, facturaId)).orderBy(asc(facturaItems.id));
}

// Marca la factura como anulada solo si sigue emitida. Devuelve false si otra anulación llegó antes.
export async function marcarAnulada(
  id: number,
  datos: { motivo: string; usuarioId: number; fecha: Date },
  ejecutor: Ejecutor = db,
): Promise<boolean> {
  const filas = await ejecutor
    .update(facturas)
    .set({ estado: "anulada", motivoAnulacion: datos.motivo, anuladaPorId: datos.usuarioId, anuladaEn: datos.fecha })
    .where(and(eq(facturas.id, id), eq(facturas.estado, "emitida")))
    .returning({ id: facturas.id });
  return filas.length > 0;
}

// ---------- Listado ----------

export type FacturaListadoFila = {
  id: number;
  puntoVenta: number;
  numero: number;
  fecha: Date;
  estado: EstadoFactura;
  forma: FormaPago;
  total: number;
  cliente: { id: number; nombre: string } | null;
  vendedor: { id: number; nombre: string };
};

type FiltrosListado = {
  // Número de comprobante ("0001-00000067", "67") o parte del nombre del cliente ya normalizado.
  numero?: { puntoVenta?: number; numero: number };
  nombreNormalizado?: string;
  desde?: Date;
  hasta?: Date;
  clienteId?: number;
  vendedorId?: number;
  forma?: FormaPago;
  estado?: EstadoFactura;
};

// Escapa los comodines de LIKE para que "50%" busque ese texto literal.
function patronContiene(texto: string): string {
  return `%${texto.replace(/[\\%_]/g, (caracter) => `\\${caracter}`)}%`;
}

function condicionFiltros(filtros: FiltrosListado): SQL | undefined {
  const condiciones: (SQL | undefined)[] = [];
  const busqueda: (SQL | undefined)[] = [];
  if (filtros.numero) {
    busqueda.push(
      and(
        eq(facturas.numero, filtros.numero.numero),
        filtros.numero.puntoVenta === undefined ? undefined : eq(facturas.puntoVenta, filtros.numero.puntoVenta),
      ),
    );
  }
  if (filtros.nombreNormalizado) {
    busqueda.push(sql`${clientes.nombreBusqueda} LIKE ${patronContiene(filtros.nombreNormalizado)} ESCAPE '\\'`);
  }
  if (busqueda.length > 0) condiciones.push(or(...busqueda));
  if (filtros.desde) condiciones.push(gte(facturas.fecha, filtros.desde));
  if (filtros.hasta) condiciones.push(lt(facturas.fecha, filtros.hasta));
  if (filtros.clienteId !== undefined) condiciones.push(eq(facturas.clienteId, filtros.clienteId));
  if (filtros.vendedorId !== undefined) condiciones.push(eq(facturas.usuarioId, filtros.vendedorId));
  if (filtros.forma) condiciones.push(eq(facturas.forma, filtros.forma));
  if (filtros.estado) condiciones.push(eq(facturas.estado, filtros.estado));
  return and(...condiciones);
}

// De la más nueva a la más vieja (sección 11.6). totalEmitido suma solo las emitidas que cumplen el filtro.
export async function listar(
  filtros: FiltrosListado & { limite: number; desplazamiento: number },
  ejecutor: Ejecutor = db,
): Promise<{ filas: FacturaListadoFila[]; total: number; totalEmitido: number }> {
  const condicion = condicionFiltros(filtros);

  const [filas, [totales]] = await Promise.all([
    ejecutor
      .select({
        id: facturas.id,
        puntoVenta: facturas.puntoVenta,
        numero: facturas.numero,
        fecha: facturas.fecha,
        estado: facturas.estado,
        forma: facturas.forma,
        total: facturas.total,
        cliente: { id: clientes.id, nombre: clientes.nombre },
        vendedor: { id: usuarios.id, nombre: usuarios.nombre },
      })
      .from(facturas)
      .leftJoin(clientes, eq(facturas.clienteId, clientes.id))
      .innerJoin(usuarios, eq(facturas.usuarioId, usuarios.id))
      .where(condicion)
      .orderBy(desc(facturas.fecha), desc(facturas.id))
      .limit(filtros.limite)
      .offset(filtros.desplazamiento),
    ejecutor
      .select({
        total: count(),
        totalEmitido: sql<number>`coalesce(sum(case when ${facturas.estado} = 'emitida' then ${facturas.total} else 0 end), 0)`.mapWith(Number),
      })
      .from(facturas)
      .leftJoin(clientes, eq(facturas.clienteId, clientes.id))
      .where(condicion),
  ]);
  return { filas, total: totales.total, totalEmitido: totales.totalEmitido };
}

// Últimas facturas de un cliente, para su ficha (RF-C3).
export async function ultimasDeCliente(clienteId: number, limite: number, ejecutor: Ejecutor = db) {
  return ejecutor
    .select({
      id: facturas.id,
      puntoVenta: facturas.puntoVenta,
      numero: facturas.numero,
      fecha: facturas.fecha,
      forma: facturas.forma,
      estado: facturas.estado,
      total: facturas.total,
    })
    .from(facturas)
    .where(eq(facturas.clienteId, clienteId))
    .orderBy(desc(facturas.fecha), desc(facturas.id))
    .limit(limite);
}

// Usuarios para el filtro de vendedor del listado (RF-V8): solo id y nombre.
export async function vendedores(ejecutor: Ejecutor = db): Promise<{ id: number; nombre: string }[]> {
  return ejecutor
    .select({ id: usuarios.id, nombre: usuarios.nombre })
    .from(usuarios)
    .orderBy(asc(usuarios.nombre), asc(usuarios.id));
}

