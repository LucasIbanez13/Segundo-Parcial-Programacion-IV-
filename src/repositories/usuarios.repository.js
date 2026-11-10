// Consultas a la tabla usuarios. Sin reglas de negocio.
// Todas aceptan `ejecutor`: se pasa `tx` para participar de una transacción.
import { and, asc, eq, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { usuarios } from "@/db/schema";

// Columnas que se pueden devolver en la API: nunca incluye clave_hash.
export const COLUMNAS_PUBLICAS = {
  id: usuarios.id,
  nombre: usuarios.nombre,
  acceso: usuarios.acceso,
  administrador: usuarios.administrador,
  activo: usuarios.activo,
};

// Comparación sin distinguir mayúsculas ni acentos. Requiere la extensión `unaccent`
// (la misma que usa la búsqueda de productos).
function contieneNormalizado(columna, patron) {
  return sql`lower(unaccent(${columna})) LIKE lower(unaccent(${patron}))`;
}

// Escapa los comodines de LIKE para que "50%" busque ese texto literal.
function escaparLike(texto) {
  return texto.replace(/[\\%_]/g, "\\$&");
}

export async function listarUsuarios({ q } = {}, ejecutor = db) {
  const patron = q ? `%${escaparLike(q)}%` : null;

  return ejecutor
    .select(COLUMNAS_PUBLICAS)
    .from(usuarios)
    .where(
      patron
        ? sql`(${contieneNormalizado(usuarios.nombre, patron)} OR ${contieneNormalizado(usuarios.acceso, patron)})`
        : undefined,
    )
    .orderBy(asc(usuarios.nombre), asc(usuarios.id));
}

// Incluye claveHash: solo para verificar la contraseña al iniciar sesión.
export async function buscarUsuarioConClavePorAcceso(acceso, ejecutor = db) {
  const [usuario] = await ejecutor.select().from(usuarios).where(eq(usuarios.acceso, acceso)).limit(1);
  return usuario ?? null;
}

export async function buscarUsuarioPorId(id, ejecutor = db) {
  const [usuario] = await ejecutor.select(COLUMNAS_PUBLICAS).from(usuarios).where(eq(usuarios.id, id)).limit(1);
  return usuario ?? null;
}

// Igual que buscarUsuarioPorId, pero bloquea la fila hasta el final de la transacción.
export async function buscarUsuarioPorIdParaActualizar(id, ejecutor) {
  const [usuario] = await ejecutor
    .select(COLUMNAS_PUBLICAS)
    .from(usuarios)
    .where(eq(usuarios.id, id))
    .limit(1)
    .for("update");
  return usuario ?? null;
}

// `excluirId` permite ignorar al propio usuario cuando se está editando.
export async function existeAcceso(acceso, { excluirId } = {}, ejecutor = db) {
  const [fila] = await ejecutor
    .select({ id: usuarios.id })
    .from(usuarios)
    .where(and(eq(usuarios.acceso, acceso), excluirId === undefined ? undefined : ne(usuarios.id, excluirId)))
    .limit(1);
  return Boolean(fila);
}

// Bloquea las filas de los administradores activos y devuelve cuántos son.
// Así dos ediciones simultáneas no pueden dejar el sistema sin administrador.
export async function contarAdministradoresActivosConBloqueo(ejecutor) {
  const filas = await ejecutor
    .select({ id: usuarios.id })
    .from(usuarios)
    .where(and(eq(usuarios.administrador, true), eq(usuarios.activo, true)))
    .orderBy(asc(usuarios.id))
    .for("update");
  return filas.length;
}

export async function insertarUsuario(datos, ejecutor = db) {
  const [usuario] = await ejecutor.insert(usuarios).values(datos).returning(COLUMNAS_PUBLICAS);
  return usuario;
}

export async function actualizarUsuario(id, cambios, ejecutor = db) {
  const [usuario] = await ejecutor
    .update(usuarios)
    .set(cambios)
    .where(eq(usuarios.id, id))
    .returning(COLUMNAS_PUBLICAS);
  return usuario ?? null;
}
