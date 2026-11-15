// Encabezado de página: título, descripción y acciones (sección 10.6: "lo que se repite se resuelve una vez").
import type { ReactNode } from "react";
import { Fila, Pila, Texto, Titulo } from "@/components/base/primitivas";

export function EncabezadoPagina({
  titulo,
  descripcion,
  acciones,
}: {
  titulo: string;
  descripcion?: string;
  acciones?: ReactNode;
}) {
  return (
    <Fila justificar="entre" alinear="fin" espacio={4} envolver>
      <Pila espacio={1}>
        <Titulo>{titulo}</Titulo>
        {descripcion && <Texto variante="suave">{descripcion}</Texto>}
      </Pila>
      {acciones && (
        <Fila espacio={2} envolver>
          {acciones}
        </Fila>
      )}
    </Fila>
  );
}
