// Estado de carga de la ficha del cliente (sección 8: carga, vacío y error).
import { Grilla } from "@/components/base/primitivas";
import { CargandoTabla } from "@/components/comunes/Estados";
import { Skeleton } from "@/components/ui/skeleton";

export default function Cargando() {
  return (
    <>
      <Skeleton className="h-14 w-72" />
      <Grilla columnas={3}>
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </Grilla>
      <CargandoTabla filas={5} />
    </>
  );
}
