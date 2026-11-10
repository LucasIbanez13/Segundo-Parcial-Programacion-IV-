// Lógica de usuarios (solo administrador; el permiso se verifica en la API).
// Contrato: docs/02-api-rest.md (Sesión y usuarios)
import { db } from "@/db";
import { hashPassword } from "@/lib/auth/password";
import { CODIGOS_ERROR, ErrorApi } from "@/lib/errors";
import { eliminarSesionesDeUsuario } from "@/repositories/sesiones.repository";
import * as usuariosRepository from "@/repositories/usuarios.repository";

const CODIGO_PG_VIOLACION_UNICA = "23505";

function errorAccesoDuplicado(acceso) {
  return new ErrorApi(409, CODIGOS_ERROR.ACCESO_DUPLICADO, `Ya existe un usuario con el acceso ${acceso}.`, { acceso });
}

function errorUsuarioNoEncontrado() {
  return new ErrorApi(404, CODIGOS_ERROR.NO_ENCONTRADO, "El usuario no existe.");
}

// La verificación previa da un error claro en el caso común; si dos altas simultáneas la pasan
// a la vez, la que pierde choca con el UNIQUE de la BD y se informa igual.
function convertirErrorDeAcceso(error, acceso) {
  const codigoPg = error?.code ?? error?.cause?.code;
  return codigoPg === CODIGO_PG_VIOLACION_UNICA ? errorAccesoDuplicado(acceso) : error;
}

export function listarUsuarios(filtros = {}) {
  return usuariosRepository.listarUsuarios(filtros);
}

export async function obtenerUsuario(id) {
  const usuario = await usuariosRepository.buscarUsuarioPorId(id);
  if (!usuario) throw errorUsuarioNoEncontrado();
  return usuario;
}

export async function crearUsuario({ contrasena, ...datos }) {
  if (await usuariosRepository.existeAcceso(datos.acceso)) throw errorAccesoDuplicado(datos.acceso);

  const claveHash = await hashPassword(contrasena);
  try {
    return await usuariosRepository.insertarUsuario({ ...datos, claveHash });
  } catch (error) {
    throw convertirErrorDeAcceso(error, datos.acceso);
  }
}

// Valida el objeto resultante (actual + cambios), no solo lo enviado.
export async function modificarUsuario(id, cambios) {
  try {
    return await db.transaction(async (tx) => {
      // Si cambia el perfil o el estado, primero se bloquean los administradores activos (siempre en
      // el mismo orden) y después el usuario: dos ediciones simultáneas esperan su turno en vez de trabarse.
      const tocaPermisos = cambios.administrador !== undefined || cambios.activo !== undefined;
      const administradoresActivos = tocaPermisos
        ? await usuariosRepository.contarAdministradoresActivosConBloqueo(tx)
        : null;

      const actual = await usuariosRepository.buscarUsuarioPorIdParaActualizar(id, tx);
      if (!actual) throw errorUsuarioNoEncontrado();

      // Un PATCH vacío es válido: no hay nada para actualizar.
      if (Object.keys(cambios).length === 0) return actual;

      const resultante = { ...actual, ...cambios };

      if (cambios.acceso !== undefined && (await usuariosRepository.existeAcceso(cambios.acceso, { excluirId: id }, tx))) {
        throw errorAccesoDuplicado(cambios.acceso);
      }

      // No se puede dejar el sistema sin un administrador activo.
      const eraAdministradorActivo = actual.administrador && actual.activo;
      const sigueSiendoAdministradorActivo = resultante.administrador && resultante.activo;
      if (eraAdministradorActivo && !sigueSiendoAdministradorActivo) {
        if (administradoresActivos <= 1) {
          throw new ErrorApi(
            409,
            CODIGOS_ERROR.ULTIMO_ADMINISTRADOR,
            "No podés desactivar ni quitarle el perfil de administrador al último administrador activo.",
          );
        }
      }

      const usuario = await usuariosRepository.actualizarUsuario(id, cambios, tx);

      // Desactivar impide el acceso aunque tenga una sesión abierta.
      if (!usuario.activo) await eliminarSesionesDeUsuario(id, tx);

      return usuario;
    });
  } catch (error) {
    throw convertirErrorDeAcceso(error, cambios.acceso);
  }
}
