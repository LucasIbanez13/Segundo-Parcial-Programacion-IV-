// Historial de movimientos de stock (manuales, iniciales y por ventas).
import Encabezado from "@/components/productos/base/Encabezado";
import VolverAProductos from "@/components/productos/base/VolverAProductos";
import MovimientosHistorial from "@/components/productos/MovimientosHistorial";

export default function MovimientosStockPage() {
  return (
    <>
      <Encabezado
        ruta="Productos / Historial"
        titulo="Movimientos de stock"
        subtitulo="Entradas y salidas registradas en el catálogo."
        accion={<VolverAProductos />}
      />
      <MovimientosHistorial />
    </>
  );
}
