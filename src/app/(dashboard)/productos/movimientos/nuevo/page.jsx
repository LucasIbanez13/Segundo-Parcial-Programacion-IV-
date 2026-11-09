// Registrar entrada / salida manual de stock (cantidad y motivo).
import Encabezado from "@/components/productos/base/Encabezado";
import VolverAProductos from "@/components/productos/base/VolverAProductos";
import MovimientoStockForm from "@/components/productos/MovimientoStockForm";

export default function NuevoMovimientoPage() {
  return (
    <>
      <Encabezado
        ruta="Productos / Stock"
        titulo="Registrar movimiento"
        subtitulo="Ingresá una entrada o salida manual de existencias."
        accion={<VolverAProductos />}
      />
      <MovimientoStockForm />
    </>
  );
}
