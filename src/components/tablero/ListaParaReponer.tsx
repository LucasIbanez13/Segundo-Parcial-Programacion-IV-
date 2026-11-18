// Productos bajo el stock mínimo (sección 11.7: sale de GET /api/productos?bajoMinimo=true), con su existencia
// frente al mínimo. Cada uno lleva a su ficha, donde el admin registra el ingreso.
import Link from "next/link";
import { EstadoVacio } from "@/components/comunes/Estados";
import { Insignia } from "@/components/comunes/InsigniaEstado";
import type { ProductoPublico } from "@/services/productos.service";

export function ListaParaReponer({ productos }: { productos: ProductoPublico[] }) {
  if (productos.length === 0) {
    return <EstadoVacio titulo="Nada para reponer" descripcion="Ningún producto activo está por debajo de su stock mínimo." />;
  }

  return (
    <ul className="flex flex-col divide-y">
      {productos.map((producto) => (
        <li key={producto.id} className="flex items-center justify-between gap-3 py-2.5">
          <div className="min-w-0">
            <Link href={`/productos/${producto.id}`} className="block truncate text-sm hover:underline">
              {producto.descripcion}
            </Link>
            <span className="font-mono text-xs text-muted-foreground">{producto.codigo}</span>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-0.5">
            <Insignia tono="advertencia">{producto.existencia} · bajo mínimo</Insignia>
            <span className="text-xs text-muted-foreground">mínimo {producto.stockMinimo}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
