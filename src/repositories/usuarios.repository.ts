// Acceso a datos de la tabla usuarios: solo consultas Drizzle, sin reglas de negocio.
// Todas aceptan un ejecutor opcional para participar de una transacción.
import "server-only";
import { and, asc, count, eq, ne, or, sql, type SQL } from "drizzle-orm";
import { db, type Ejecutor } from "@/db";
import { usuarios, type UsuarioNuevo } from "@/db/schema";

// Columnas que pueden salir de la capa de servicios: nunca el hash de contraseña.
const COLUMNAS_PUBLICAS = {
  id: usuarios.id,
  nombre: usuarios.nombre,
  email: usuarios.email,
  rol: usuarios.rol,
  activo: usuarios.activo,
  createdAt: usuarios.createdAt,
};

export type UsuarioPublicoFila = {
  id: number;
  nombre: string;
  email: string;
  rol: "admin" | "vendedor";
  activo: boolean;
  createdAt: Date;
};

// Escapa los comodines de LIKE para que "50%" busque ese texto literal.
function patronContiene(texto: string): string {
  return `%${texto.replace(/[\\%_]/g, (caracter) => `\\${caracter}`)}%`;
}

function condicionFiltros({ q, activo }: { q?: string; activo?: boolean }): SQL | undefined {
  const condiciones: (SQL | undefined)[] = [];
  if (q) {
    // LIKE en SQLite no distingue mayúsculas en texto ASCII. ESCAPE hace literales los comodines escapados.
    const patron = patronContiene(q);
    condiciones.push(
      or(sql`${usuarios.nombre} LIKE ${patron} ESCAPE '\\'`, sql`${usuarios.email} LIKE ${patron} ESCAPE '\\'`),
    );
  }
  if (activo !== undefined) condiciones.push(eq(usuarios.activo, activo));
  return and(...condiciones);
}

export async function listar(
  filtros: { q?: string; activo?: boolean; limite: number; desplazamiento: number },
  ejecutor: Ejecutor = db,
): Promise<{ filas: UsuarioPublicoFila[]; total: number }> {
  const condicion = condicionFiltros(filtros);
  const [filas, [{ total }]] = await Promise.all([
    ejecutor
      .select(COLUMNAS_PUBLICAS)
      .from(usuarios)
      .where(condicion)
      .orderBy(asc(usuarios.nombre), asc(usuarios.id))
      .limit(filtros.limite)
      .offset(filtros.desplazamiento),
    ejecutor.select({ total: count() }).from(usuarios).where(condicion),
  ]);
  return { filas, total };
}

export async function buscarPorId(id: number, ejecutor: Ejecutor = db): Promise<UsuarioPublicoFila | null> {
  const [fila] = await ejecutor.select(COLUMNAS_PUBLICAS).from(usuarios).where(eq(usuarios.id, id)).limit(1);
  return fila ?? null;
}

// Incluye el hash: solo para verificar contraseñas dentro de auth.service.
export async function buscarConHashPorEmail(email: string, ejecutor: Ejecutor = db) {
  const [fila] = await ejecutor.select().from(usuarios).where(eq(usuarios.email, email)).limit(1);
  return fila ?? null;
}

export async function buscarConHashPorId(id: number, ejecutor: Ejecutor = db) {
  const [fila] = await ejecutor.select().from(usuarios).where(eq(usuarios.id, id)).limit(1);
  return fila ?? null;
}

// `excluirId` permite ignorar al propio usuario cuando se está editando.
export async function existeEmail(email: string, excluirId?: number, ejecutor: Ejecutor = db): Promise<boolean> {
  const [fila] = await ejecutor
    .select({ id: usuarios.id })
    .from(usuarios)
    .where(and(eq(usuarios.email, email), excluirId === undefined ? undefined : ne(usuarios.id, excluirId)))
    .limit(1);
  return Boolean(fila);
}

export async function insertar(datos: UsuarioNuevo, ejecutor: Ejecutor = db): Promise<UsuarioPublicoFila> {
  const [fila] = await ejecutor.insert(usuarios).values(datos).returning(COLUMNAS_PUBLICAS);
  return fila;
}

export async function actualizar(
  id: number,
  cambios: Partial<Pick<UsuarioNuevo, "nombre" | "email" | "rol" | "activo" | "passwordHash">>,
  ejecutor: Ejecutor = db,
): Promise<UsuarioPublicoFila | null> {
  const [fila] = await ejecutor.update(usuarios).set(cambios).where(eq(usuarios.id, id)).returning(COLUMNAS_PUBLICAS);
  return fila ?? null;
}
