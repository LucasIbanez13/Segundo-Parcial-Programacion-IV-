// Acceso a datos de la tabla categorias: solo consultas Drizzle, sin reglas de negocio.
// Todas aceptan un ejecutor opcional para participar de una transacción.
import "server-only";
import { and, asc, count, eq, ne } from "drizzle-orm";
import { db, type Ejecutor } from "@/db";
import { categorias, productos, type CategoriaNueva } from "@/db/schema";

const COLUMNAS_PUBLICAS = {
  id: categorias.id,
  nombre: categorias.nombre,
  activa: categorias.activa,
};

export type CategoriaPublicaFila = { id: number; nombre: string; activa: boolean };

// Clave del índice único: minúsculas con las reglas del español (también "Í" -> "í"), en forma Unicode NFC
// para que la misma letra acentuada escrita de dos maneras dé el mismo texto.
function normalizarNombre(nombre: string): string {
  return nombre.normalize("NFC").toLocaleLowerCase("es-AR");
}

export async function listar(
  filtros: { activa?: boolean },
  ejecutor: Ejecutor = db,
): Promise<CategoriaPublicaFila[]> {
  return ejecutor
    .select(COLUMNAS_PUBLICAS)
    .from(categorias)
    .where(filtros.activa === undefined ? undefined : eq(categorias.activa, filtros.activa))
    .orderBy(asc(categorias.nombre), asc(categorias.id));
}

export async function buscarPorId(id: number, ejecutor: Ejecutor = db): Promise<CategoriaPublicaFila | null> {
  const [fila] = await ejecutor.select(COLUMNAS_PUBLICAS).from(categorias).where(eq(categorias.id, id)).limit(1);
  return fila ?? null;
}

// Compara sin distinguir mayúsculas, igual que el índice único categorias_nombre_unico.
export async function existeNombre(nombre: string, excluirId?: number, ejecutor: Ejecutor = db): Promise<boolean> {
  const [fila] = await ejecutor
    .select({ id: categorias.id })
    .from(categorias)
    .where(
      and(
        eq(categorias.nombreNormalizado, normalizarNombre(nombre)),
        excluirId === undefined ? undefined : ne(categorias.id, excluirId),
      ),
    )
    .limit(1);
  return Boolean(fila);
}

export async function contarProductosActivos(categoriaId: number, ejecutor: Ejecutor = db): Promise<number> {
  const [{ total }] = await ejecutor
    .select({ total: count() })
    .from(productos)
    .where(and(eq(productos.categoriaId, categoriaId), eq(productos.activo, true)));
  return total;
}

export async function insertar(
  datos: Pick<CategoriaNueva, "nombre" | "activa">,
  ejecutor: Ejecutor = db,
): Promise<CategoriaPublicaFila> {
  const [fila] = await ejecutor
    .insert(categorias)
    .values({ ...datos, nombreNormalizado: normalizarNombre(datos.nombre) })
    .returning(COLUMNAS_PUBLICAS);
  return fila;
}

export async function actualizar(
  id: number,
  cambios: Partial<Pick<CategoriaNueva, "nombre" | "activa">>,
  ejecutor: Ejecutor = db,
): Promise<CategoriaPublicaFila | null> {
  const [fila] = await ejecutor
    .update(categorias)
    .set(cambios.nombre === undefined ? cambios : { ...cambios, nombreNormalizado: normalizarNombre(cambios.nombre) })
    .where(eq(categorias.id, id))
    .returning(COLUMNAS_PUBLICAS);
  return fila ?? null;
}
