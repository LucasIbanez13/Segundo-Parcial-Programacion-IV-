// Estado de carga de Ventas (sección 8: carga, vacío y error).
import { CargandoTabla } from "@/components/comunes/Estados";
import { Skeleton } from "@/components/ui/skeleton";

export default function Cargando() {
  return (
    <>
      <Skeleton className="h-14 w-72" />
      <CargandoTabla filas={8} />
    </>
  );
}
