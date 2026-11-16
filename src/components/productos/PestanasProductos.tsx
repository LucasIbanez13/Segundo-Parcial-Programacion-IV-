"use client";

// Pestañas del módulo Productos (sección 4): catálogo, movimientos de stock y categorías.
import { Boxes, History, Tags } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

const PESTANAS = [
  { href: "/productos", texto: "Catálogo", icono: Boxes },
  { href: "/productos/movimientos", texto: "Movimientos de stock", icono: History },
  { href: "/productos/categorias", texto: "Categorías", icono: Tags },
];

// "Catálogo" queda activa también en la ficha, el alta y la edición de un producto.
function estaActiva(ruta: string, href: string) {
  if (href !== "/productos") return ruta.startsWith(href);
  return !PESTANAS.slice(1).some((pestana) => ruta.startsWith(pestana.href));
}

export function PestanasProductos() {
  const ruta = usePathname();
  return (
    <nav aria-label="Secciones de productos" className="flex gap-1 overflow-x-auto border-b">
      {PESTANAS.map(({ href, texto, icono: Icono }) => {
        const activa = estaActiva(ruta, href);
        return (
          <Button
            key={href}
            asChild
            variant="ghost"
            size="sm"
            className={
              activa
                ? "rounded-b-none border-b-2 border-primary text-foreground"
                : "rounded-b-none border-b-2 border-transparent text-muted-foreground"
            }
          >
            <Link href={href} aria-current={activa ? "page" : undefined}>
              <Icono /> {texto}
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}
