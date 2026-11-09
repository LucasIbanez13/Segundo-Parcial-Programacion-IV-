import Link from "next/link";
import BadgeEstado from "./BadgeEstado";
import { ENLACE, TABLA, TD, TH } from "./base/estilos";
import { formatearMoneda } from "./formato";

// Tabla de productos: nombre, código, precio, stock, estado y edición.
export default function ProductosTable({ productos }) {
  return (
    <table className={TABLA}>
      <thead>
        <tr>
          <th className={TH}>Producto</th>
          <th className={TH}>Código</th>
          <th className={`${TH} text-right`}>Precio</th>
          <th className={`${TH} text-right`}>Stock</th>
          <th className={TH}>Estado</th>
          <th className={TH} aria-label="Acciones" />
        </tr>
      </thead>
      <tbody>
        {productos.map((producto) => (
          <tr key={producto.id}>
            <td className={`${TD} font-bold`}>{producto.nombre}</td>
            <td className={TD}>{producto.codigo}</td>
            <td className={`${TD} text-right`}>{formatearMoneda(producto.precioVentaCentavos)}</td>
            <td className={`${TD} text-right`}>{producto.stockActual}</td>
            <td className={TD}>
              <BadgeEstado producto={producto} />
            </td>
            <td className={TD}>
              <Link href={`/productos/${producto.id}/editar`} className={ENLACE}>
                Editar
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
