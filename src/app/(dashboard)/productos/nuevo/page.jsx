// Alta de producto.
import Encabezado from "@/components/productos/base/Encabezado";
import VolverAProductos from "@/components/productos/base/VolverAProductos";
import ProductoForm from "@/components/productos/ProductoForm";

export default function NuevoProductoPage() {
  return (
    <>
      <Encabezado
        ruta="Productos / Alta"
        titulo="Nuevo producto"
        subtitulo="Agregá un producto al catálogo del comercio."
        accion={<VolverAProductos />}
      />
      <ProductoForm />
    </>
  );
}
