// Conexión a PostgreSQL con Drizzle ORM. La URL se toma de la variable de entorno DATABASE_URL.
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/index.js";

// En desarrollo, Next.js recarga los módulos con cada cambio. Guardamos la conexión en globalThis
// para reutilizarla y no abrir conexiones nuevas en cada recarga.
export const conexion = globalThis.conexionPostgres ?? postgres(process.env.DATABASE_URL);

if (process.env.NODE_ENV !== "production") {
  globalThis.conexionPostgres = conexion;
}

// Instancia que usan los repositories para hacer las consultas.
export const db = drizzle(conexion, { schema });
