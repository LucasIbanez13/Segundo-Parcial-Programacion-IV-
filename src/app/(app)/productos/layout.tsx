// Módulo Productos (sección 4): pestañas comunes a catálogo, movimientos y categorías.
// Consultar es para ambos roles; las pantallas de edición verifican el rol, y los servicios también (sección 10.5).
import { Pila } from "@/components/base/primitivas";
import { PestanasProductos } from "@/components/productos/PestanasProductos";

export default function LayoutProductos({ children }: { children: React.ReactNode }) {
  return (
    <Pila espacio={6}>
      <PestanasProductos />
      {children}
    </Pila>
  );
}
