// Consultas a la tabla productos. Sin reglas de negocio.
// Todas aceptan `ejecutor`: se pasa `tx` para participar de una transacción.
import { and, asc, eq, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { movimientosStock, productos } from "@/db/schema";

// Comparación sin distinguir mayúsculas ni acentos. Requiere la extensión `unaccent`.
// Primero unaccent y después lower: con locale C, lower() no convierte letras acentuadas ("É").
function contieneNormalizado(columna, patron) {
  return sql`lower(unaccent(${columna})) LIKE lower(unaccent(${patron}))`;
}

// Escapa los comodines de LIKE para que "50%" busque ese texto literal.
// La barra invertida ya es el carácter de escape por defecto de LIKE.
function escaparLike(texto) {
  return texto.replace(/[\\%_]/g, "\\$&");
}

export async function listarProductos({ q, activo } = {}, ejecutor = db) {
  const condiciones = [];

  if (q) {
    const patron = `%${escaparLike(q)}%`;
    condiciones.push(
      sql`(${contieneNormalizado(productos.nombre, patron)} OR ${contieneNormalizado(productos.codigo, patron)})`,
    );
  }
  if (activo !== undefined) {
    condiciones.push(eq(productos.activo, activo));
  }

  return ejecutor
    .select()
    .from(productos)
    .where(and(...condiciones))
    .orderBy(asc(productos.nombre), asc(productos.id));
}

export async function obtenerProductoPorId(id, ejecutor = db) {
  const [producto] = await ejecutor.select().from(productos).where(eq(productos.id, id));
  return producto ?? null;
}

// Usa lower() igual que el índice único, así la búsqueda coincide con la restricción.
// `excluirId` permite ignorar al propio producto cuando se está editando.
export async function obtenerProductoPorCodigo(codigo, { excluirId } = {}, ejecutor = db) {
  const [producto] = await ejecutor
    .select()
    .from(productos)
    .where(
      and(
        sql`lower(${productos.codigo}) = lower(${codigo})`,
        excluirId === undefined ? undefined : ne(productos.id, excluirId),
      ),
    );
  return producto ?? null;
}

export async function crearProducto(datos, ejecutor = db) {
  const [producto] = await ejecutor.insert(productos).values(datos).returning();
  return producto;
}

export async function actualizarProducto(id, cambios, ejecutor = db) {
  const [producto] = await ejecutor.update(productos).set(cambios).where(eq(productos.id, id)).returning();
  return producto ?? null;
}

// Una sola consulta para los tres indicadores de la pantalla de productos.
export async function obtenerEstadisticasStock({ umbralStockBajo, diasRecientes }, ejecutor = db) {
  const [estadisticas] = await ejecutor
    .select({
      productosActivos: sql`count(*) FILTER (WHERE ${productos.activo})`.mapWith(Number),
      productosStockBajo:
        sql`count(*) FILTER (WHERE ${productos.activo} AND ${productos.stockActual} <= ${umbralStockBajo})`.mapWith(
          Number,
        ),
      movimientosRecientes: sql`(
        SELECT count(*) FROM ${movimientosStock}
        WHERE ${movimientosStock.fecha} >= now() - make_interval(days => ${diasRecientes})
      )`.mapWith(Number),
    })
    .from(productos);
  return estadisticas;
}
