"use client";

// Acciones de cada categoría (RF-P7): renombrar y activar/desactivar. Solo se muestran al administrador;
// igual, categorias.service vuelve a verificar el rol y responde 403 al vendedor.
import { Pencil, Power, PowerOff, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { editarCategoriaAccion } from "@/app/(app)/productos/acciones";
import { CampoFormulario, propsDeCampo } from "@/components/comunes/CampoFormulario";
import { ConfirmarAccion } from "@/components/comunes/ConfirmarAccion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useFormulario } from "@/hooks/use-formulario";
import { editarCategoriaSchema } from "@/lib/schemas/categorias";
import type { CategoriaPublica } from "@/services/categorias.service";

function DialogoRenombrar({ categoria }: { categoria: CategoriaPublica }) {
  const [abierto, setAbierto] = useState(false);
  const { valores, setValores, cambiar, errores, enviando, onSubmit } = useFormulario<{ nombre: string }, CategoriaPublica>({
    valoresIniciales: { nombre: categoria.nombre },
    esquema: editarCategoriaSchema,
    enviar: (datos) => editarCategoriaAccion(categoria.id, datos),
    mensajeExito: "Se guardó el nombre de la categoría.",
    alExito: () => setAbierto(false),
  });

  return (
    <Dialog
      open={abierto}
      onOpenChange={(valor) => {
        setAbierto(valor);
        if (valor) setValores({ nombre: categoria.nombre });
      }}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8" aria-label={`Renombrar ${categoria.nombre}`}>
          <Pencil />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Renombrar categoría</DialogTitle>
            <DialogDescription>Los productos de la categoría la van a mostrar con el nombre nuevo.</DialogDescription>
          </DialogHeader>
          <CampoFormulario id="nombre-categoria" etiqueta="Nombre" error={errores.nombre}>
            <Input
              {...propsDeCampo("nombre-categoria", errores.nombre)}
              autoComplete="off"
              value={valores.nombre}
              onChange={(e) => cambiar("nombre", e.target.value)}
            />
          </CampoFormulario>
          <DialogFooter>
            <Button type="submit" disabled={enviando}>
              <Save /> {enviando ? "Guardando…" : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AccionesCategoria({ categoria }: { categoria: CategoriaPublica }) {
  async function cambiarEstado() {
    const resultado = await editarCategoriaAccion(categoria.id, { activa: !categoria.activa });
    if (!resultado.ok) {
      toast.error(resultado.error.message);
      return false;
    }
    toast.success(resultado.data.activa ? "Categoría activada." : "Categoría desactivada.");
  }

  return (
    <div className="flex items-center justify-end gap-0.5">
      <DialogoRenombrar categoria={categoria} />
      <ConfirmarAccion
        disparador={
          <Button
            variant="ghost"
            size="icon"
            aria-label={categoria.activa ? `Desactivar ${categoria.nombre}` : `Activar ${categoria.nombre}`}
            className={categoria.activa ? "size-8 text-destructive hover:text-destructive" : "size-8 text-exito hover:text-exito"}
          >
            {categoria.activa ? <PowerOff /> : <Power />}
          </Button>
        }
        titulo={categoria.activa ? `¿Desactivar ${categoria.nombre}?` : `¿Activar ${categoria.nombre}?`}
        descripcion={
          categoria.activa
            ? "No se va a poder elegir para productos nuevos. Solo se puede desactivar si no tiene productos activos."
            : "Se va a poder volver a elegir para los productos."
        }
        textoConfirmar={categoria.activa ? "Desactivar" : "Activar"}
        peligrosa={categoria.activa}
        onConfirmar={cambiarEstado}
      />
    </div>
  );
}
