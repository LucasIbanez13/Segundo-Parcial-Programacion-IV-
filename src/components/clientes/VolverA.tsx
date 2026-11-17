// Enlace para volver a la pantalla anterior ("← Clientes"), arriba del título.
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export function VolverA({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground print:hidden"
    >
      <ArrowLeft className="size-4" /> {children}
    </Link>
  );
}
