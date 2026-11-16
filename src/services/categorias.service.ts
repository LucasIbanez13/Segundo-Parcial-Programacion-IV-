// Servicio de categorías (sección 10.2, RF-P7). Consultar: ambos roles. Alta y edición: solo admin (sección 3).
import "server-only";
import { db } from "@/db";
import { exigirRol, type UsuarioSesion } from "@/lib/auth/permisos";
import { ApiError, errores } from "@/lib/errors";
import { crearCategoriaSchema, editarCategoriaSchema, filtrosCategoriasSchema } from "@/lib/schemas/categorias";
import { validar } from "@/lib/schemas/validar";
import * as categoriasRepo from "@/repositories/categorias.repository";
import type { CategoriaPublicaFila } from "@/repositories/categorias.repository";

export type CategoriaPublica = CategoriaPublicaFila;

function errorNombreDuplicado(nombre: string) {
  return new ApiError(409, "NOMBRE_DUPLICADO", `Ya existe una categoría llamada ${nombre}.`, [
    { campo: "nombre", mensaje: "Ya existe una categoría con ese nombre." },
  ]);
}

// Si dos altas simultáneas pasan la verificación previa, la segunda choca con el índice único.
function esViolacionUnica(error: unknown): boolean {
  const texto = String((error as { cause?: unknown })?.cause ?? error);
  return texto.includes("UNIQUE constraint failed: categorias.nombre_normalizado");
}

// RF-P7: todas las categorías activas, sin paginar (sección 11.4).
// El admin puede pedir activa=false o activa=todos; un vendedor que lo pida recibe 403.
export async function listarCategorias(actor: UsuarioSesion, filtros: unknown): Promise<CategoriaPublica[]> {
  const { activa } = validar(filtrosCategoriasSchema, filtros);
  exigirRol(actor, ...(activa === "true" ? (["admin", "vendedor"] as const) : (["admin"] as const)));

  return categoriasRepo.listar({ activa: activa === "todos" ? undefined : activa === "true" });
}

// RF-P7: alta. Nombre único sin distinguir mayúsculas (409 NOMBRE_DUPLICADO). Nace activa.
export async function crearCategoria(actor: UsuarioSesion, datos: unknown): Promise<CategoriaPublica> {
  exigirRol(actor, "admin");
  const { nombre } = validar(crearCategoriaSchema, datos);

  if (await categoriasRepo.existeNombre(nombre)) throw errorNombreDuplicado(nombre);
  try {
    return await categoriasRepo.insertar({ nombre, activa: true });
  } catch (error) {
    if (esViolacionUnica(error)) throw errorNombreDuplicado(nombre);
    throw error;
  }
}

// RF-P7: edición y baja lógica. No se desactiva una categoría con productos activos (409 CATEGORIA_EN_USO):
// así un producto que se ofrece en ventas siempre tiene una categoría activa.
export async function editarCategoria(actor: UsuarioSesion, id: number, datos: unknown): Promise<CategoriaPublica> {
  exigirRol(actor, "admin");
  const cambios = validar(editarCategoriaSchema, datos);

  try {
    return await db.transaction(async (tx) => {
      const actual = await categoriasRepo.buscarPorId(id, tx);
      if (!actual) throw errores.noEncontrado("La categoría");
      if (Object.keys(cambios).length === 0) return actual;

      if (cambios.nombre !== undefined && (await categoriasRepo.existeNombre(cambios.nombre, id, tx))) {
        throw errorNombreDuplicado(cambios.nombre);
      }

      if (cambios.activa === false && actual.activa) {
        const activos = await categoriasRepo.contarProductosActivos(id, tx);
        if (activos > 0) {
          throw new ApiError(
            409,
            "CATEGORIA_EN_USO",
            `No se puede desactivar ${actual.nombre}: tiene ${activos} producto${activos === 1 ? "" : "s"} activo${activos === 1 ? "" : "s"}.`,
          );
        }
      }

      return (await categoriasRepo.actualizar(id, cambios, tx))!;
    });
  } catch (error) {
    if (esViolacionUnica(error)) throw errorNombreDuplicado(cambios.nombre ?? "");
    throw error;
  }
}
