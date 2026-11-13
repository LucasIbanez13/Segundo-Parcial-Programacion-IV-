// Servicio de usuarios (sección 10.2). Todas las operaciones son solo para el administrador (sección 3).
// Orden: verifica el rol, valida con el esquema, aplica las reglas y devuelve la forma pública.
// El rol va primero porque todo el módulo es solo admin: un vendedor recibe 403 SIN_PERMISO
// aunque mande datos inválidos (lista de control 10.8, punto 2).
import "server-only";
import { db } from "@/db";
import { exigirRol, type UsuarioSesion } from "@/lib/auth/permisos";
import { generarPasswordTemporal, hashPassword } from "@/lib/auth/password";
import { ApiError, errores } from "@/lib/errors";
import type { Pagina } from "@/lib/schemas/comun";
import { crearUsuarioSchema, editarUsuarioSchema, filtrosUsuariosSchema } from "@/lib/schemas/usuarios";
import { validar } from "@/lib/schemas/validar";
import * as usuariosRepo from "@/repositories/usuarios.repository";
import type { UsuarioPublicoFila } from "@/repositories/usuarios.repository";

// Forma pública de un usuario en la API: sin hash y con la fecha en ISO 8601 UTC (sección 11.1).
export type UsuarioPublico = Omit<UsuarioPublicoFila, "createdAt"> & { createdAt: string };

function aPublico(fila: UsuarioPublicoFila): UsuarioPublico {
  return { ...fila, createdAt: fila.createdAt.toISOString() };
}

function errorEmailDuplicado(email: string) {
  return new ApiError(409, "EMAIL_DUPLICADO", `Ya existe un usuario con el email ${email}.`, [
    { campo: "email", mensaje: "Ya existe un usuario con ese email." },
  ]);
}

// Si dos altas simultáneas pasan la verificación previa, la segunda choca con el UNIQUE de la base:
// se informa igual como EMAIL_DUPLICADO en vez de un 500.
function esViolacionUnica(error: unknown): boolean {
  const texto = String((error as { cause?: unknown })?.cause ?? error);
  return texto.includes("UNIQUE constraint failed: usuarios.email");
}

// RF-U4: listado paginado con búsqueda por nombre o email y filtro de estado.
export async function listarUsuarios(actor: UsuarioSesion, filtros: unknown): Promise<Pagina<UsuarioPublico>> {
  exigirRol(actor, "admin");
  const { q, activo, page, pageSize } = validar(filtrosUsuariosSchema, filtros);

  const { filas, total } = await usuariosRepo.listar({
    q,
    activo,
    limite: pageSize,
    desplazamiento: (page - 1) * pageSize,
  });
  return { data: filas.map(aPublico), page, pageSize, total };
}

// RF-U4: consulta de un usuario (la usa la pantalla de edición).
export async function obtenerUsuario(actor: UsuarioSesion, id: number): Promise<UsuarioPublico> {
  exigirRol(actor, "admin");
  const fila = await usuariosRepo.buscarPorId(id);
  if (!fila) throw errores.noEncontrado("El usuario");
  return aPublico(fila);
}

// RF-U4, RF-U3 (el seed crea el primer administrador con esta misma función).
// La contraseña es temporal y se guarda con hash bcrypt (sección 8).
export async function crearUsuario(actor: UsuarioSesion, datos: unknown): Promise<UsuarioPublico> {
  exigirRol(actor, "admin");
  const { password, ...resto } = validar(crearUsuarioSchema, datos);

  if (await usuariosRepo.existeEmail(resto.email)) throw errorEmailDuplicado(resto.email);

  try {
    const fila = await usuariosRepo.insertar({ ...resto, activo: true, passwordHash: await hashPassword(password) });
    return aPublico(fila);
  } catch (error) {
    if (esViolacionUnica(error)) throw errorEmailDuplicado(resto.email);
    throw error;
  }
}

// RF-U4: edita nombre, email, rol o estado. Un admin no puede desactivarse ni quitarse el rol a sí mismo
// (422 OPERACION_SOBRE_SI_MISMO); eso además garantiza que siempre quede al menos un administrador activo.
// Al desactivar, el usuario pierde el acceso en su próximo pedido: la sesión se resuelve contra la base.
export async function editarUsuario(actor: UsuarioSesion, id: number, datos: unknown): Promise<UsuarioPublico> {
  exigirRol(actor, "admin");
  const cambios = validar(editarUsuarioSchema, datos);

  if (id === actor.id && (cambios.activo === false || (cambios.rol !== undefined && cambios.rol !== "admin"))) {
    throw new ApiError(
      422,
      "OPERACION_SOBRE_SI_MISMO",
      "No podés desactivarte ni quitarte el rol de administrador a vos mismo.",
    );
  }

  try {
    return await db.transaction(async (tx) => {
      const actual = await usuariosRepo.buscarPorId(id, tx);
      if (!actual) throw errores.noEncontrado("El usuario");
      if (Object.keys(cambios).length === 0) return aPublico(actual);

      if (cambios.email !== undefined && (await usuariosRepo.existeEmail(cambios.email, id, tx))) {
        throw errorEmailDuplicado(cambios.email);
      }

      const fila = await usuariosRepo.actualizar(id, cambios, tx);
      return aPublico(fila!);
    });
  } catch (error) {
    if (esViolacionUnica(error)) throw errorEmailDuplicado(cambios.email ?? "");
    throw error;
  }
}

// RF-U5: el administrador restablece la contraseña de un usuario. Devuelve la contraseña temporal,
// que se muestra una sola vez: en la base solo queda su hash.
export async function restablecerPassword(actor: UsuarioSesion, id: number): Promise<{ passwordTemporal: string }> {
  exigirRol(actor, "admin");

  const passwordTemporal = generarPasswordTemporal();
  const fila = await usuariosRepo.actualizar(id, { passwordHash: await hashPassword(passwordTemporal) });
  if (!fila) throw errores.noEncontrado("El usuario");

  return { passwordTemporal };
}
