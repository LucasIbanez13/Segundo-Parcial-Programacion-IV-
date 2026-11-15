// Campo con etiqueta, ayuda y mensaje de error junto al campo (sección 8: "validación en ambos lados").
import type { ReactNode } from "react";
import { Pila, Texto } from "@/components/base/primitivas";
import { Label } from "@/components/ui/label";

export function CampoFormulario({
  id,
  etiqueta,
  error,
  ayuda,
  children,
  className,
}: {
  id: string;
  etiqueta: string;
  error?: string;
  ayuda?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Pila espacio={2} className={className}>
      <Label htmlFor={id}>{etiqueta}</Label>
      {children}
      {error ? (
        <Texto variante="error" id={`${id}-error`} role="alert" className="text-xs">
          {error}
        </Texto>
      ) : (
        ayuda && (
          <Texto variante="chico" id={`${id}-ayuda`}>
            {ayuda}
          </Texto>
        )
      )}
    </Pila>
  );
}

// Props de accesibilidad para el control dentro del campo.
export function propsDeCampo(id: string, error?: string) {
  return {
    id,
    name: id,
    "aria-invalid": Boolean(error) || undefined,
    "aria-describedby": error ? `${id}-error` : undefined,
  };
}
