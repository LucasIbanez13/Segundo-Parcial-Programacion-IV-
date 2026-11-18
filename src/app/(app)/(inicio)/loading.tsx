// Estado de carga del tablero de inicio (sección 8: carga, vacío y error).
import { Skeleton } from "@/components/ui/skeleton";

export default function Cargando() {
  return (
    <>
      <Skeleton className="h-14 w-64" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, indice) => (
          <Skeleton key={indice} className="h-28" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-5">
        <Skeleton className="h-80 lg:col-span-3" />
        <Skeleton className="h-80 lg:col-span-2" />
      </div>
      <div className="grid gap-4 lg:grid-cols-5">
        <Skeleton className="h-72 lg:col-span-3" />
        <Skeleton className="h-72 lg:col-span-2" />
      </div>
    </>
  );
}
