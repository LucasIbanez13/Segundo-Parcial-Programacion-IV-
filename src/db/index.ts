// Conexión a la base de datos con Drizzle + libSQL.
// Desarrollo: archivo SQLite local. Producción: Turso (DATABASE_URL=libsql://... + DATABASE_AUTH_TOKEN).
import "server-only";
import { createClient, type Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

// En desarrollo Next.js recarga los módulos en cada cambio: se reutiliza el cliente para no abrir uno por recarga.
const globalParaDb = globalThis as unknown as { clienteLibsql?: Client };

const cliente =
  globalParaDb.clienteLibsql ??
  createClient({
    url: process.env.DATABASE_URL ?? "file:./local.db",
    authToken: process.env.DATABASE_AUTH_TOKEN || undefined,
  });

if (process.env.NODE_ENV !== "production") globalParaDb.clienteLibsql = cliente;

export const db = drizzle(cliente, { schema });

// Tipo del ejecutor de consultas: la conexión o una transacción abierta con db.transaction().
export type Ejecutor = typeof db | Parameters<Parameters<typeof db.transaction>[0]>[0];
