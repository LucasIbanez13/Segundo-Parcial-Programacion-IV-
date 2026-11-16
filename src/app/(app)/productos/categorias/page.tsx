// /productos/categorias — categorías (RF-P7). El admin ve activas e inactivas y las edita;
// el vendedor ve solo las activas, sin acciones.
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Pila, Texto } from "@/components/base/primitivas";
import { EncabezadoPagina } from "@/components/comunes/EncabezadoPagina";
import { EstadoError, EstadoVacio } from "@/components/comunes/Estados";
import { InsigniaActivo } from "@/components/comunes/InsigniaEstado";
import { AccionesCategoria } from "@/components/productos/AccionesCategoria";
import { FormularioCategoria } from "@/components/productos/FormularioCategoria";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCurrentUser } from "@/lib/auth/sesion";
import { esAdmin } from "@/lib/auth/permisos";
import { ApiError } from "@/lib/errors";
import { listarCategorias } from "@/services/categorias.service";

export const metadata: Metadata = { title: "Categorías" };

export default async function PaginaCategorias() {
  const usuario = await getCurrentUser();
  if (!usuario) redirect("/login");
  const admin = esAdmin(usuario);

  let categorias;
  try {
    categorias = await listarCategorias(usuario, { activa: admin ? "todos" : "true" });
  } catch (error) {
    if (error instanceof ApiError) return <EstadoError mensaje={error.message} />;
    throw error;
  }

  return (
    <>
      <EncabezadoPagina titulo="Categorías" descripcion="Agrupan los productos del catálogo." />
      <Card>
        <CardContent>
          <Pila espacio={6}>
            {admin && <FormularioCategoria />}
            {categorias.length === 0 ? (
              <EstadoVacio
                titulo="Todavía no hay categorías"
                descripcion={admin ? "Agregá la primera para poder cargar productos." : undefined}
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Estado</TableHead>
                    {admin && <TableHead className="text-right">Acciones</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categorias.map((categoria) => (
                    <TableRow key={categoria.id}>
                      <TableCell>
                        <Texto variante="fuerte">{categoria.nombre}</Texto>
                      </TableCell>
                      <TableCell>
                        <InsigniaActivo activo={categoria.activa} femenino />
                      </TableCell>
                      {admin && (
                        <TableCell className="text-right">
                          <AccionesCategoria categoria={categoria} />
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Pila>
        </CardContent>
      </Card>
    </>
  );
}
