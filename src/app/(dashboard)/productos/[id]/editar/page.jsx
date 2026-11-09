// Edición de producto (incluye activar / desactivar).
import Encabezado from "@/components/productos/base/Encabezado";
import VolverAProductos from "@/components/productos/base/VolverAProductos";
import EditarProducto from "@/components/productos/EditarProducto";

export default async function EditarProductoPage({ params }) {
  const { id } = await params;

  return (
    <>
      <Encabezado
        ruta="Productos / Edición"
        titulo="Editar producto"
        subtitulo="Actualizá los datos del producto en el catálogo."
        accion={<VolverAProductos />}
      />
      <EditarProducto id={id} />
    </>
  );
}
