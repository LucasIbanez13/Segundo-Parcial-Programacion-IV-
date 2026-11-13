// Script de datos iniciales: pnpm run db:seed (RF-U3, sección 8 "Datos de prueba", sección 10.7).
// Crea los datos con los MISMOS servicios que usa la aplicación, así cumplen todas las reglas.
// Se puede correr más de una vez: lo que ya existe no se duplica.
// Por ahora carga los usuarios (hito 1); categorías, productos, clientes y facturas se suman en cada hito.
import type { UsuarioSesion } from "@/lib/auth/permisos";
import { ApiError } from "@/lib/errors";
import { crearUsuario } from "@/services/usuarios.service";

// Actor con rol admin para el script: todavía no hay nadie logueado cuando se crea el primer administrador.
const SISTEMA: UsuarioSesion = { id: 0, nombre: "Script de datos iniciales", email: "seed@sistema", rol: "admin" };

function leerVariable(nombre: string): string {
  const valor = process.env[nombre]?.trim();
  if (!valor) throw new Error(`Falta la variable ${nombre} en el archivo .env (ver .env.example).`);
  return valor;
}

async function crearSiNoExiste(datos: { nombre: string; email: string; rol: "admin" | "vendedor"; password: string }) {
  try {
    const usuario = await crearUsuario(SISTEMA, datos);
    console.log(`  + ${usuario.rol.padEnd(8)} ${usuario.email}`);
  } catch (error) {
    if (error instanceof ApiError && error.code === "EMAIL_DUPLICADO") {
      console.log(`  = ${datos.rol.padEnd(8)} ${datos.email} (ya existía)`);
      return;
    }
    throw error;
  }
}

async function main() {
  console.log("Usuarios:");
  await crearSiNoExiste({
    nombre: leerVariable("SEED_ADMIN_NOMBRE"),
    email: leerVariable("SEED_ADMIN_EMAIL"),
    rol: "admin",
    password: leerVariable("SEED_ADMIN_PASSWORD"),
  });
  await crearSiNoExiste({
    nombre: leerVariable("SEED_VENDEDOR_NOMBRE"),
    email: leerVariable("SEED_VENDEDOR_EMAIL"),
    rol: "vendedor",
    password: leerVariable("SEED_VENDEDOR_PASSWORD"),
  });
  console.log("Datos iniciales listos.");
}

main().catch((error) => {
  console.error("No se pudieron cargar los datos iniciales:", error instanceof ApiError ? error.toJSON() : error);
  process.exitCode = 1;
});
