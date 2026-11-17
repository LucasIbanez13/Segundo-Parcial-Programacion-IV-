// Tablas facturas y factura_items (enunciado, sección 7; RF-V1 a RF-V9).
// Una factura confirmada no se modifica: solo pasa a "anulada" con su motivo (regla 5).
import { sql } from "drizzle-orm";
import { check, index, integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { ESTADOS_FACTURA, FORMAS_PAGO, TIPOS_TARJETA } from "@/lib/constants";
import { clientes } from "./clientes";
import { productos } from "./productos";
import { usuarios } from "./usuarios";

export const facturas = sqliteTable(
  "facturas",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    // "0001-00001233": punto de venta y número correlativo sin huecos, asignado al confirmar (regla 4).
    puntoVenta: integer("punto_venta").notNull(),
    numero: integer("numero").notNull(),
    fecha: integer("fecha", { mode: "timestamp_ms" }).notNull(),
    // Centavos (regla 10). Suma de los subtotales, calculada por el servidor.
    total: integer("total").notNull(),
    forma: text("forma", { enum: FORMAS_PAGO }).notNull(),
    // Regla 9: de la tarjeta solo tipo, marca y últimos 4 dígitos.
    tarjetaTipo: text("tarjeta_tipo", { enum: TIPOS_TARJETA }),
    tarjetaMarca: text("tarjeta_marca"),
    tarjetaUltimos4: text("tarjeta_ultimos4"),
    // Contado: lo que entregó el cliente (el vuelto es montoRecibido − total).
    montoRecibido: integer("monto_recibido"),
    estado: text("estado", { enum: ESTADOS_FACTURA }).notNull().default("emitida"),
    // Anulación (RF-V9): motivo, cuándo y quién.
    motivoAnulacion: text("motivo_anulacion"),
    anuladaEn: integer("anulada_en", { mode: "timestamp_ms" }),
    anuladaPorId: integer("anulada_por_id").references(() => usuarios.id),
    // null = consumidor final.
    clienteId: integer("cliente_id").references(() => clientes.id),
    // Vendedor (regla 11).
    usuarioId: integer("usuario_id")
      .notNull()
      .references(() => usuarios.id),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (tabla) => [
    unique("facturas_numero_unico").on(tabla.puntoVenta, tabla.numero),
    index("facturas_fecha_idx").on(tabla.fecha),
    index("facturas_cliente_idx").on(tabla.clienteId),
    check("facturas_total_positivo", sql`${tabla.total} > 0`),
    check("facturas_forma_valida", sql`${tabla.forma} IN ('contado', 'tarjeta', 'cuenta_corriente')`),
    check("facturas_estado_valido", sql`${tabla.estado} IN ('emitida', 'anulada')`),
    // Regla 6: consumidor final no compra en cuenta corriente.
    check("facturas_cuenta_con_cliente", sql`${tabla.forma} <> 'cuenta_corriente' OR ${tabla.clienteId} IS NOT NULL`),
    // Regla 9: los datos de tarjeta van completos solo en pagos con tarjeta, y son exactamente 4 dígitos.
    check(
      "facturas_datos_tarjeta",
      sql`(${tabla.forma} = 'tarjeta' AND ${tabla.tarjetaTipo} IN ('debito', 'credito') AND ${tabla.tarjetaMarca} IS NOT NULL AND ${tabla.tarjetaUltimos4} GLOB '[0-9][0-9][0-9][0-9]')
        OR (${tabla.forma} <> 'tarjeta' AND ${tabla.tarjetaTipo} IS NULL AND ${tabla.tarjetaMarca} IS NULL AND ${tabla.tarjetaUltimos4} IS NULL)`,
    ),
    check(
      "facturas_monto_recibido",
      sql`(${tabla.forma} = 'contado' AND ${tabla.montoRecibido} >= ${tabla.total}) OR (${tabla.forma} <> 'contado' AND ${tabla.montoRecibido} IS NULL)`,
    ),
    check(
      "facturas_anulacion_con_motivo",
      sql`${tabla.estado} = 'emitida' OR (${tabla.motivoAnulacion} IS NOT NULL AND ${tabla.anuladaEn} IS NOT NULL AND ${tabla.anuladaPorId} IS NOT NULL)`,
    ),
  ],
);

export const facturaItems = sqliteTable(
  "factura_items",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    facturaId: integer("factura_id")
      .notNull()
      .references(() => facturas.id),
    productoId: integer("producto_id")
      .notNull()
      .references(() => productos.id),
    // Copiados del catálogo al confirmar: cambiar el producto no altera la factura (regla 3).
    codigo: text("codigo").notNull(),
    descripcion: text("descripcion").notNull(),
    cantidad: integer("cantidad").notNull(),
    precioUnitario: integer("precio_unitario").notNull(),
    subtotal: integer("subtotal").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (tabla) => [
    // Un renglón por producto: agregar uno repetido suma la cantidad (RF-V3).
    unique("factura_items_producto_unico").on(tabla.facturaId, tabla.productoId),
    check("factura_items_cantidad_positiva", sql`${tabla.cantidad} > 0`),
    check("factura_items_precio_positivo", sql`${tabla.precioUnitario} > 0`),
    check("factura_items_subtotal", sql`${tabla.subtotal} = ${tabla.cantidad} * ${tabla.precioUnitario}`),
  ],
);

export type FacturaFila = typeof facturas.$inferSelect;
export type FacturaNueva = typeof facturas.$inferInsert;
export type FacturaItemFila = typeof facturaItems.$inferSelect;
export type FacturaItemNuevo = typeof facturaItems.$inferInsert;
