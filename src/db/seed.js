// Script de inicialización: crea el primer administrador con los datos del .env.
// Ejecutar con: npm run db:seed
// Se puede correr más de una vez sin duplicar al administrador.
import bcrypt from "bcryptjs";
import { conexion, db } from "./index.js";
import { usuarios } from "./schema/index.js";

const RONDAS_BCRYPT = 12;

// Devuelve el valor de una variable de entorno sin espacios en los extremos, o corta si falta.
function leerVariable(nombreVariable) {
  const valor = process.env[nombreVariable]?.trim();
  if (!valor) {
    throw new Error(`Falta la variable ${nombreVariable} en el archivo .env`);
  }
  return valor;
}

async function crearAdministrador() {
  leerVariable("DATABASE_URL");
  const nombre = leerVariable("ADMIN_NOMBRE");
  const acceso = leerVariable("ADMIN_ACCESO").toLowerCase();
  const claveHash = await bcrypt.hash(leerVariable("ADMIN_CONTRASENA"), RONDAS_BCRYPT);

  // Si el acceso ya existe, solo se asegura que esté activo y sea administrador.
  // Su nombre y su contraseña no se pisan.
  await db
    .insert(usuarios)
    .values({ nombre, acceso, claveHash, activo: true, administrador: true })
    .onConflictDoUpdate({
      target: usuarios.acceso,
      set: { activo: true, administrador: true },
    });

  console.log(`Administrador listo: ${acceso}`);
}

try {
  await crearAdministrador();
} catch (error) {
  console.error("No se pudo inicializar la base de datos:", error.message);
  process.exitCode = 1;
} finally {
  // Cierra la conexión para que el proceso termine.
  await conexion.end();
}
