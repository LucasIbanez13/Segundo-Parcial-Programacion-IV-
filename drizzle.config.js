// Configuración de Drizzle Kit (migraciones y creación de tablas).
// Lee DATABASE_URL desde el archivo .env

/** @type {import('drizzle-kit').Config} */
export default {
  schema: "./src/db/schema/index.js",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
};
