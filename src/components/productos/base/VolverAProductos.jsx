import Link from "next/link";
import { BOTON_SECUNDARIO } from "./estilos";

export default function VolverAProductos() {
  return (
    <Link href="/productos" className={BOTON_SECUNDARIO}>
      ← Volver a productos
    </Link>
  );
}
