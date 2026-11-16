"use client";

// Alta y edición de productos (RF-P2). Valida con los mismos esquemas de Zod que el servidor y guarda con
// Server Actions, que llaman a productos.service. La existencia no se edita: el stock inicial se carga como ingreso.
import { Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CampoFormulario, propsDeCampo } from "@/components/comunes/CampoFormulario";
import { CampoImporte } from "@/components/comunes/CampoImporte";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { crearProductoAccion, editarProductoAccion } from "@/app/(app)/productos/acciones";
import { useFormulario } from "@/hooks/use-formulario";
import { centavosATextoEditable, textoACentavos, textoAEntero } from "@/lib/format";
import { crearProductoSchema, editarProductoSchema } from "@/lib/schemas/productos";
import type { CategoriaPublica } from "@/services/categorias.service";
import type { ProductoPublico } from "@/services/productos.service";

type Valores = {
  codigo: string;
  descripcion: string;
  categoriaId: string;
  precio: string;
  stockMinimo: string;
  stockInicial: string;
};

export function FormularioProducto({
  producto = null,
  categorias,
}: {
  producto?: ProductoPublico | null;
  // Categorías que se pueden elegir: las activas (y, al editar, la actual aunque esté inactiva).
  categorias: CategoriaPublica[];
}) {
  const router = useRouter();
  const esEdicion = producto !== null;

  const { valores, cambiar, errores, errorGeneral, enviando, onSubmit } = useFormulario<Valores, ProductoPublico>({
    valoresIniciales: {
      codigo: producto?.codigo ?? "",
      descripcion: producto?.descripcion ?? "",
      categoriaId: producto ? String(producto.categoria.id) : "",
      precio: producto ? centavosATextoEditable(producto.precio) : "",
      stockMinimo: String(producto?.stockMinimo ?? 0),
      stockInicial: "",
    },
    esquema: esEdicion ? editarProductoSchema : crearProductoSchema,
    // Pesos -> centavos y textos -> números: el servidor solo recibe enteros (regla 10).
    preparar: ({ codigo, descripcion, categoriaId, precio, stockMinimo, stockInicial }) => {
      const datos = {
        codigo,
        descripcion,
        categoriaId: categoriaId ? Number(categoriaId) : undefined,
        precio: textoACentavos(precio),
        stockMinimo: textoAEntero(stockMinimo),
      };
      return esEdicion ? datos : { ...datos, stockInicial: textoAEntero(stockInicial) };
    },
    enviar: (datos) => (esEdicion ? editarProductoAccion(producto.id, datos) : crearProductoAccion(datos)),
    mensajeExito: (data) => (esEdicion ? `Se guardaron los cambios de ${data.codigo}.` : `Producto ${data.codigo} creado.`),
    alExito: (data) => router.push(`/productos/${data.id}`),
  });

  const categoriaElegida = categorias.find((categoria) => String(categoria.id) === valores.categoriaId);

  return (
    <Card className="max-w-2xl">
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
        <CardHeader>
          <CardTitle>Datos del producto</CardTitle>
          <CardDescription>
            {esEdicion
              ? "La existencia no se edita acá: registrá un ingreso o un egreso desde la ficha del producto."
              : "El precio es el de venta final, con impuestos incluidos."}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <CampoFormulario id="codigo" etiqueta="Código" error={errores.codigo} ayuda="Único. Ej. HE-001.">
            <Input
              {...propsDeCampo("codigo", errores.codigo)}
              autoComplete="off"
              className="font-mono"
              value={valores.codigo}
              onChange={(e) => cambiar("codigo", e.target.value)}
            />
          </CampoFormulario>
          <CampoFormulario id="categoriaId" etiqueta="Categoría" error={errores.categoriaId}>
            <Select value={valores.categoriaId} onValueChange={(valor) => cambiar("categoriaId", valor)}>
              <SelectTrigger {...propsDeCampo("categoriaId", errores.categoriaId)} className="w-full">
                <SelectValue placeholder="Seleccioná una categoría">{categoriaElegida?.nombre}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {categorias.map((categoria) => (
                  <SelectItem key={categoria.id} value={String(categoria.id)}>
                    {categoria.nombre}
                    {!categoria.activa && " (inactiva)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CampoFormulario>
          <CampoFormulario id="descripcion" etiqueta="Descripción" error={errores.descripcion} className="sm:col-span-2">
            <Input
              {...propsDeCampo("descripcion", errores.descripcion)}
              placeholder="Ej. Martillo carpintero 500 g"
              autoComplete="off"
              value={valores.descripcion}
              onChange={(e) => cambiar("descripcion", e.target.value)}
            />
          </CampoFormulario>
          <CampoFormulario
            id="precio"
            etiqueta="Precio de venta"
            error={errores.precio}
            ayuda={esEdicion ? "Las facturas ya emitidas conservan su precio." : "En pesos, con coma para los centavos."}
          >
            <CampoImporte
              {...propsDeCampo("precio", errores.precio)}
              value={valores.precio}
              onChange={(e) => cambiar("precio", e.target.value)}
            />
          </CampoFormulario>
          <CampoFormulario
            id="stockMinimo"
            etiqueta="Stock mínimo"
            error={errores.stockMinimo}
            ayuda="Por debajo de este número se marca para reponer."
          >
            <Input
              {...propsDeCampo("stockMinimo", errores.stockMinimo)}
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              value={valores.stockMinimo}
              onChange={(e) => cambiar("stockMinimo", e.target.value)}
            />
          </CampoFormulario>
          {!esEdicion && (
            <CampoFormulario
              id="stockInicial"
              etiqueta="Stock inicial (opcional)"
              error={errores.stockInicial}
              ayuda="Se registra como un ingreso con motivo “Stock inicial”."
            >
              <Input
                {...propsDeCampo("stockInicial", errores.stockInicial)}
                type="number"
                min={0}
                step={1}
                inputMode="numeric"
                placeholder="0"
                value={valores.stockInicial}
                onChange={(e) => cambiar("stockInicial", e.target.value)}
              />
            </CampoFormulario>
          )}
          {errorGeneral && (
            <Alert variant="destructive" className="sm:col-span-2">
              <AlertDescription>{errorGeneral}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link href={esEdicion ? `/productos/${producto.id}` : "/productos"}>Cancelar</Link>
          </Button>
          <Button type="submit" disabled={enviando} className="w-full sm:w-auto">
            <Save />
            {enviando ? "Guardando…" : esEdicion ? "Guardar cambios" : "Crear producto"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
