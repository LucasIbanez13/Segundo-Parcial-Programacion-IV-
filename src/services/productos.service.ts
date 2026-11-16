// Servicio de productos (sección 10.2, RF-P1 a RF-P3). Consultar: ambos roles. Alta, edición y baja: solo admin.
// La existencia nunca se edita acá: solo cambia con moverStock() (stock.service).
import "server-only";
import { db, type Ejecutor } from "@/db";
import { exigirRol, type UsuarioSesion } from "@/lib/auth/permisos";
import { MOTIVO_STOCK_INICIAL } from "@/lib/constants";
import { ApiError, errores } from "@/lib/errors";
import type { Pagina } from "@/lib/schemas/comun";
import { crearProductoSchema, editarProductoSchema, filtrosProductosSchema } from "@/lib/schemas/productos";
import { validar } from "@/lib/schemas/validar";
import * as categoriasRepo from "@/repositories/categorias.repository";
import * as productosRepo from "@/repositories/productos.repository";
import type { ProductoPublicoFila } from "@/repositories/productos.repository";
import { moverStock } from "@/services/stock.service";

// Forma pública de un producto (sección 11.4): incluye la marca bajoMinimo.
export type ProductoPublico = ProductoPublicoFila & { bajoMinimo: boolean };

// RF-P1: un producto está bajo el mínimo cuando su existencia es menor que el stock mínimo.
function aPublico(fila: ProductoPublicoFila): ProductoPublico {
  return { ...fila, bajoMinimo: fila.existencia < fila.stockMinimo };
}

function errorCodigoDuplicado(codigo: string) {
  return new ApiError(409, "CODIGO_DUPLICADO", `Ya existe un producto con el código ${codigo}.`, [
    { campo: "codigo", mensaje: "Ya existe un producto con ese código." },
  ]);
}

function esViolacionUnica(error: unknown): boolean {
  const texto = String((error as { cause?: unknown })?.cause ?? error);
  return texto.includes("productos_codigo_unico") || texto.includes("UNIQUE constraint failed: productos.codigo");
}

// La categoría tiene que existir y, si el producto queda activo, estar activa (RF-P7).
async function exigirCategoria(categoriaId: number, productoActivo: boolean, tx: Ejecutor): Promise<void> {
  const categoria = await categoriasRepo.buscarPorId(categoriaId, tx);
  if (!categoria || (productoActivo && !categoria.activa)) {
    throw new ApiError(422, "VALIDACION", "Hay campos con errores.", [
      { campo: "categoriaId", mensaje: categoria ? "La categoría está inactiva." : "La categoría no existe." },
    ]);
  }
}

// RF-P1: catálogo paginado con búsqueda por código o descripción, filtro por categoría y bajo mínimo.
// Por defecto solo activos; activo=false o activo=todos quedan para el admin (sección 11.4).
export async function listarProductos(actor: UsuarioSesion, filtros: unknown): Promise<Pagina<ProductoPublico>> {
  const { q, categoriaId, bajoMinimo, activo, page, pageSize } = validar(filtrosProductosSchema, filtros);
  exigirRol(actor, ...(activo === "true" ? (["admin", "vendedor"] as const) : (["admin"] as const)));

  const { filas, total } = await productosRepo.listar({
    q,
    categoriaId,
    bajoMinimo,
    activo: activo === "todos" ? undefined : activo === "true",
    limite: pageSize,
    desplazamiento: (page - 1) * pageSize,
  });
  return { data: filas.map(aPublico), page, pageSize, total };
}

// RF-P1: ficha de un producto (también los inactivos, que conservan su historial). Ambos roles.
export async function obtenerProducto(actor: UsuarioSesion, id: number): Promise<ProductoPublico> {
  exigirRol(actor, "admin", "vendedor");
  const fila = await productosRepo.buscarPorId(id);
  if (!fila) throw errores.noEncontrado("El producto");
  return aPublico(fila);
}

// RF-P2: alta. Código único (409 CODIGO_DUPLICADO). El producto nace con existencia 0 y, si hay stockInicial,
// se registra un ingreso con motivo "Stock inicial" en la misma transacción (regla 2).
export async function crearProducto(actor: UsuarioSesion, datos: unknown): Promise<ProductoPublico> {
  exigirRol(actor, "admin");
  const { stockInicial, existencia: _existencia, ...producto } = validar(crearProductoSchema, datos);

  try {
    return await db.transaction(async (tx) => {
      if (await productosRepo.existeCodigo(producto.codigo, undefined, tx)) {
        throw errorCodigoDuplicado(producto.codigo);
      }
      await exigirCategoria(producto.categoriaId, true, tx);

      const id = await productosRepo.insertar(producto, tx);
      if (stockInicial) {
        await moverStock(tx, {
          productoId: id,
          usuarioId: actor.id,
          tipo: "ingreso",
          cantidad: stockInicial,
          motivo: MOTIVO_STOCK_INICIAL,
        });
      }
      return aPublico((await productosRepo.buscarPorId(id, tx))!);
    });
  } catch (error) {
    if (esViolacionUnica(error)) throw errorCodigoDuplicado(producto.codigo);
    throw error;
  }
}

// RF-P2 (edición) y RF-P3 (baja lógica con activo: false). `existencia` se rechaza con 422 desde el esquema.
// Cambiar el precio no altera facturas emitidas: cada ítem guarda su precio unitario (regla 3).
export async function editarProducto(actor: UsuarioSesion, id: number, datos: unknown): Promise<ProductoPublico> {
  exigirRol(actor, "admin");
  const { existencia: _existencia, ...cambios } = validar(editarProductoSchema, datos);

  try {
    return await db.transaction(async (tx) => {
      const actual = await productosRepo.buscarPorId(id, tx);
      if (!actual) throw errores.noEncontrado("El producto");
      if (Object.keys(cambios).length === 0) return aPublico(actual);

      if (cambios.codigo !== undefined && (await productosRepo.existeCodigo(cambios.codigo, id, tx))) {
        throw errorCodigoDuplicado(cambios.codigo);
      }

      // Si el producto queda activo, su categoría tiene que estar activa: al cambiarla o al reactivarlo.
      const quedaActivo = cambios.activo ?? actual.activo;
      const categoriaCambia = cambios.categoriaId !== undefined && cambios.categoriaId !== actual.categoria.id;
      const seReactiva = cambios.activo === true && !actual.activo;
      if (categoriaCambia || seReactiva) {
        await exigirCategoria(cambios.categoriaId ?? actual.categoria.id, quedaActivo, tx);
      }

      await productosRepo.actualizar(id, cambios, tx);
      return aPublico((await productosRepo.buscarPorId(id, tx))!);
    });
  } catch (error) {
    if (esViolacionUnica(error)) throw errorCodigoDuplicado(cambios.codigo ?? "");
    throw error;
  }
}
