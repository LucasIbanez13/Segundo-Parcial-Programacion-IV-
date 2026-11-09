// Listado de productos, búsqueda e indicadores de stock.
import Link from "next/link";
import Encabezado from "@/components/productos/base/Encabezado";
import { BOTON_PRIMARIO } from "@/components/productos/base/estilos";
import ProductosListado from "@/components/productos/ProductosListado";
import ProductosStats from "@/components/productos/ProductosStats";
import { obtenerEstadisticasStock } from "@/services/productos.service";

// Los indicadores cambian con cada venta o movimiento: no se pueden generar en el build.
export const dynamic = "force-dynamic";

const AVISOS = {
  "producto-creado": "Producto guardado.",
  "producto-actualizado": "Cambios guardados.",
  "movimiento-registrado": "Movimiento registrado.",
};

// Los indicadores no tienen endpoint: el Server Component puede consultar el service.
async function cargarEstadisticas() {
  try {
    return await obtenerEstadisticasStock();
  } catch (error) {
    console.error("No se pudieron cargar los indicadores de stock:", error);
    return null;
  }
}

export default async function ProductosPage({ searchParams }) {
  const [{ aviso }, estadisticas] = await Promise.all([searchParams, cargarEstadisticas()]);

  return (
    <>
      <Encabezado
        ruta="Catálogo / Existencias"
        titulo="Productos y stock"
        subtitulo="Administrá tu catálogo y seguí las existencias."
        accion={
          <Link href="/productos/nuevo" className={BOTON_PRIMARIO}>
            + Nuevo producto
          </Link>
        }
      />
      <ProductosStats estadisticas={estadisticas} />
      <ProductosListado avisoExito={AVISOS[aviso]} />
    </>
  );
}
