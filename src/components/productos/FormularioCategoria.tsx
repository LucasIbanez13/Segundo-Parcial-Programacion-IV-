"use client";

// Alta rápida de una categoría (RF-P7). Valida con el mismo esquema de Zod que el servidor.
import { Plus } from "lucide-react";
import { Fila } from "@/components/base/primitivas";
import { CampoFormulario, propsDeCampo } from "@/components/comunes/CampoFormulario";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { crearCategoriaAccion } from "@/app/(app)/productos/acciones";
import { useFormulario } from "@/hooks/use-formulario";
import { crearCategoriaSchema } from "@/lib/schemas/categorias";
import type { CategoriaPublica } from "@/services/categorias.service";

export function FormularioCategoria() {
  const { valores, setValores, cambiar, errores, enviando, onSubmit } = useFormulario<{ nombre: string }, CategoriaPublica>({
    valoresIniciales: { nombre: "" },
    esquema: crearCategoriaSchema,
    enviar: (datos) => crearCategoriaAccion(datos),
    mensajeExito: (data) => `Categoría ${data.nombre} creada.`,
    alExito: () => setValores({ nombre: "" }),
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      <Fila alinear="inicio" espacio={2} className="flex-col sm:flex-row">
        <CampoFormulario id="nombre" etiqueta="Nueva categoría" error={errores.nombre} className="w-full sm:max-w-sm">
          <Input
            {...propsDeCampo("nombre", errores.nombre)}
            placeholder="Ej. Herramientas"
            autoComplete="off"
            value={valores.nombre}
            onChange={(e) => cambiar("nombre", e.target.value)}
          />
        </CampoFormulario>
        <Button type="submit" disabled={enviando} className="w-full sm:mt-[1.375rem] sm:w-auto">
          <Plus /> {enviando ? "Agregando…" : "Agregar"}
        </Button>
      </Fila>
    </form>
  );
}
