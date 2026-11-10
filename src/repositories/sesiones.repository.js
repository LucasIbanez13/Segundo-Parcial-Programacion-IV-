// Consultas a la tabla sesiones (crear, buscar por token, borrar, borrar las de un usuario).
// Sin reglas de negocio. Todas aceptan `ejecutor`: se pasa `tx` para participar de una transacción.
import { and, eq, gt, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import { sesiones, usuarios } from "@/db/schema";

export async function insertarSesion({ id, usuarioId, expiraEn }, ejecutor = db) {
  await ejecutor.insert(sesiones).values({ id, usuarioId, expiraEn });
}

// Sesión vigente (no expirada) junto con los datos públicos de su usuario, o null.
export async function buscarSesionVigenteConUsuario(id, ejecutor = db) {
  const [fila] = await ejecutor
    .select({
      id: sesiones.id,
      expiraEn: sesiones.expiraEn,
      usuario: {
        id: usuarios.id,
        nombre: usuarios.nombre,
        acceso: usuarios.acceso,
        administrador: usuarios.administrador,
        activo: usuarios.activo,
      },
    })
    .from(sesiones)
    .innerJoin(usuarios, eq(sesiones.usuarioId, usuarios.id))
    .where(and(eq(sesiones.id, id), gt(sesiones.expiraEn, sql`now()`)))
    .limit(1);

  return fila ?? null;
}

export async function eliminarSesion(id, ejecutor = db) {
  await ejecutor.delete(sesiones).where(eq(sesiones.id, id));
}

export async function eliminarSesionesDeUsuario(usuarioId, ejecutor = db) {
  await ejecutor.delete(sesiones).where(eq(sesiones.usuarioId, usuarioId));
}

export async function eliminarSesionesVencidas(ejecutor = db) {
  await ejecutor.delete(sesiones).where(lte(sesiones.expiraEn, sql`now()`));
}
