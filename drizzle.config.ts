// Configuración de drizzle-kit: genera y aplica las migraciones de src/db/schema.
// Desarrollo: archivo SQLite local (DATABASE_URL=file:./local.db). Producción: Turso (libsql://...).
import { defineConfig } from "drizzle-kit";

// Carga .env si existe (en Vercel/CI las variables ya vienen del entorno).
try {
  process.loadEnvFile();
} catch {
  // sin archivo .env: se usan las variables del entorno
}

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dialect: "turso",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "file:./local.db",
    authToken: process.env.DATABASE_AUTH_TOKEN || undefined,
  },
});
