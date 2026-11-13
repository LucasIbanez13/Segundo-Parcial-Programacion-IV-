// Paginador. La página vive en la URL (sección 10.6), así un listado se puede recargar y compartir.
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Fila, Texto } from "@/components/base/primitivas";
import { Button } from "@/components/ui/button";

function urlDePagina(ruta: string, parametros: Record<string, string | undefined>, pagina: number) {
  const busqueda = new URLSearchParams();
  for (const [clave, valor] of Object.entries(parametros)) if (valor) busqueda.set(clave, valor);
  if (pagina > 1) busqueda.set("page", String(pagina));
  else busqueda.delete("page");
  const texto = busqueda.toString();
  return texto ? `${ruta}?${texto}` : ruta;
}

export function Paginador({
  ruta,
  parametros,
  page,
  pageSize,
  total,
}: {
  ruta: string;
  parametros: Record<string, string | undefined>;
  page: number;
  pageSize: number;
  total: number;
}) {
  const paginas = Math.max(1, Math.ceil(total / pageSize));
  const desde = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const hasta = Math.min(page * pageSize, total);

  return (
    <Fila justificar="entre" envolver espacio={3}>
      <Texto variante="suave">
        {desde}–{hasta} de {total}
      </Texto>
      <Fila espacio={2}>
        <Button variant="outline" size="sm" asChild={page > 1} disabled={page <= 1}>
          {page > 1 ? (
            <Link href={urlDePagina(ruta, parametros, page - 1)}>
              <ChevronLeft /> Anterior
            </Link>
          ) : (
            <><ChevronLeft /> Anterior</>
          )}
        </Button>
        <Texto variante="suave">
          Página {Math.min(page, paginas)} de {paginas}
        </Texto>
        <Button variant="outline" size="sm" asChild={page < paginas} disabled={page >= paginas}>
          {page < paginas ? (
            <Link href={urlDePagina(ruta, parametros, page + 1)}>
              Siguiente <ChevronRight />
            </Link>
          ) : (
            <>Siguiente <ChevronRight /></>
          )}
        </Button>
      </Fila>
    </Fila>
  );
}
