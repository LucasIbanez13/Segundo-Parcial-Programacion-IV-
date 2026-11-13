// Aviso temporal para los módulos que todavía no se implementaron (se reemplaza en cada hito).
import { Construction } from "lucide-react";
import { Pila, Texto } from "@/components/base/primitivas";
import { Card, CardContent } from "@/components/ui/card";

export function ModuloPendiente({ requerimientos }: { requerimientos: string }) {
  return (
    <Card>
      <CardContent>
        <Pila espacio={3} className="items-center py-10 text-center">
          <Construction className="size-8 text-advertencia" aria-hidden />
          <Texto variante="fuerte">Este módulo se está construyendo</Texto>
          <Texto variante="suave">Va a cubrir {requerimientos}.</Texto>
        </Pila>
      </CardContent>
    </Card>
  );
}
