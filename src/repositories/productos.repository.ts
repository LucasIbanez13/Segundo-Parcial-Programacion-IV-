// Acceso a datos de la tabla productos: solo consultas Drizzle, sin reglas de negocio.
// Todas aceptan un ejecutor opcional para participar de una transacción.
import "server-only";
import { and, asc, count, eq, lt, ne, or, sql, type SQL } from "drizzle-orm";
import { db, type Ejecutor } from "@/db";
import { categorias, productos, type ProductoNuevo } from "@/db/schema";

// Producto con su categoría, tal como lo necesita la forma pública de la API (sección 11.4).
const COLUMNAS_PUBLICAS = {
  id: productos.id,
  codigo: productos.codigo,
  descripcion: productos.descripcion,
  categoria: { id: categorias.id, nombre: categorias.nombre },
  precio: productos.precio,
  existencia: productos.existencia,
  stockMinimo: productos.stockMinimo,
  activo: productos.activo,
};

export type ProductoPublicoFila = {
  id: number;
  codigo: string;
  descripcion: string;
  categoria: { id: number; nombre: string };
  precio: number;
  existencia: number;
  stockMinimo: number;
  activo: boolean;
};

// Campos que se pueden editar. La existencia NO está: solo la cambia sumarExistencia() desde moverStock().
export type CambiosProducto = Partial<
  Pick<ProductoNuevo, "codigo" | "descripcion" | "categoriaId" | "precio" | "stockMinimo" | "activo">
>;

// Escapa los comodines de LIKE para que "50%" busque ese texto literal.
function patronContiene(texto: string): string {
  return `%${texto.replace(/[\\%_]/g, (caracter) => `\\${caracter}`)}%`;
}

function condicionFiltros(filtros: {
  q?: string;
  categoriaId?: number;
  bajoMinimo?: boolean;
  activo?: boolean;
}): SQL | undefined {
  const condiciones: (SQL | undefined)[] = [];
  if (filtros.q) {
    const patron = patronContiene(filtros.q);
    condiciones.push(
      or(
        sql`${productos.codigo} LIKE ${patron} ESCAPE '\\'`,
        sql`${productos.descripcion} LIKE ${patron} ESCAPE '\\'`,
      ),
    );
  }
  if (filtros.categoriaId !== undefined) condiciones.push(eq(productos.categoriaId, filtros.categoriaId));
  if (filtros.bajoMinimo === true) condiciones.push(lt(productos.existencia, productos.stockMinimo));
  if (filtros.bajoMinimo === false) condiciones.push(sql`${productos.existencia} >= ${productos.stockMinimo}`);
  if (filtros.activo !== undefined) condiciones.push(eq(productos.activo, filtros.activo));
  return and(...condiciones);
}

export async function listar(
  filtros: {
    q?: string;
    categoriaId?: number;
    bajoMinimo?: boolean;
    activo?: boolean;
    limite: number;
    desplazamiento: number;
  },
  ejecutor: Ejecutor = db,
): Promise<{ filas: ProductoPublicoFila[]; total: number }> {
  const condicion = condicionFiltros(filtros);
  const [filas, [{ total }]] = await Promise.all([
    ejecutor
      .select(COLUMNAS_PUBLICAS)
      .from(productos)
      .innerJoin(categorias, eq(productos.categoriaId, categorias.id))
      .where(condicion)
      .orderBy(asc(productos.codigo), asc(productos.id))
      .limit(filtros.limite)
      .offset(filtros.desplazamiento),
    ejecutor.select({ total: count() }).from(productos).where(condicion),
  ]);
  return { filas, total };
}

export async function buscarPorId(id: number, ejecutor: Ejecutor = db): Promise<ProductoPublicoFila | null> {
  const [fila] = await ejecutor
    .select(COLUMNAS_PUBLICAS)
    .from(productos)
    .innerJoin(categorias, eq(productos.categoriaId, categorias.id))
    .where(eq(productos.id, id))
    .limit(1);
  return fila ?? null;
}

// Compara sin distinguir mayúsculas, igual que el índice único productos_codigo_unico.
export async function existeCodigo(codigo: string, excluirId?: number, ejecutor: Ejecutor = db): Promise<boolean> {
  const [fila] = await ejecutor
    .select({ id: productos.id })
    .from(productos)
    .where(
      and(
        sql`lower(${productos.codigo}) = lower(${codigo})`,
        excluirId === undefined ? undefined : ne(productos.id, excluirId),
      ),
    )
    .limit(1);
  return Boolean(fila);
}

// Alta con existencia 0: el stock inicial entra después como movimiento de ingreso (RF-P2, regla 2).
export async function insertar(
  datos: Required<Pick<ProductoNuevo, "codigo" | "descripcion" | "categoriaId" | "precio" | "stockMinimo">>,
  ejecutor: Ejecutor = db,
): Promise<number> {
  const [fila] = await ejecutor
    .insert(productos)
    .values({ ...datos, existencia: 0, activo: true })
    .returning({ id: productos.id });
  return fila.id;
}

export async function actualizar(id: number, cambios: CambiosProducto, ejecutor: Ejecutor = db): Promise<boolean> {
  const filas = await ejecutor
    .update(productos)
    .set(cambios)
    .where(eq(productos.id, id))
    .returning({ id: productos.id });
  return filas.length > 0;
}

// UPDATE condicional atómico: suma `delta` (con signo) solo si la existencia no queda negativa.
// Devuelve la existencia resultante, o null si el producto no existe o no alcanza el stock.
// Solo la llama moverStock() (sección 10.2): ninguna otra función modifica la existencia.
export async function sumarExistencia(id: number, delta: number, ejecutor: Ejecutor): Promise<number | null> {
  const [fila] = await ejecutor
    .update(productos)
    .set({ existencia: sql`${productos.existencia} + ${delta}` })
    .where(and(eq(productos.id, id), sql`${productos.existencia} + ${delta} >= 0`))
    .returning({ existencia: productos.existencia });
  return fila?.existencia ?? null;
}

// Datos mínimos para armar el mensaje de STOCK_INSUFICIENTE.
export async function buscarExistencia(
  id: number,
  ejecutor: Ejecutor = db,
): Promise<{ id: number; codigo: string; existencia: number } | null> {
  const [fila] = await ejecutor
    .select({ id: productos.id, codigo: productos.codigo, existencia: productos.existencia })
    .from(productos)
    .where(eq(productos.id, id))
    .limit(1);
  return fila ?? null;
}
