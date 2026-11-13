// Tabla del listado de usuarios (RF-U4). Nunca recibe el hash de contraseña.
import { Fila, Pila, Texto } from "@/components/base/primitivas";
import { EstadoVacio } from "@/components/comunes/Estados";
import { Insignia, InsigniaActivo } from "@/components/comunes/InsigniaEstado";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ETIQUETAS_ROL } from "@/lib/constants";
import { formatearFecha } from "@/lib/format";
import type { UsuarioPublico } from "@/services/usuarios.service";
import { AccionesUsuario } from "./AccionesUsuario";

function InsigniaRol({ rol }: { rol: UsuarioPublico["rol"] }) {
  return <Insignia tono={rol === "admin" ? "principal" : "neutro"}>{ETIQUETAS_ROL[rol]}</Insignia>;
}

export function TablaUsuarios({
  usuarios,
  idActual,
  hayFiltros,
}: {
  usuarios: UsuarioPublico[];
  idActual: number;
  hayFiltros: boolean;
}) {
  if (usuarios.length === 0) {
    return (
      <EstadoVacio
        titulo={hayFiltros ? "No hay usuarios que coincidan" : "Todavía no hay usuarios"}
        descripcion={hayFiltros ? "Probá con otra búsqueda o cambiá el filtro de estado." : undefined}
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Usuario</TableHead>
          <TableHead className="hidden lg:table-cell">Email</TableHead>
          <TableHead className="hidden sm:table-cell">Rol</TableHead>
          <TableHead className="hidden sm:table-cell">Estado</TableHead>
          <TableHead className="hidden xl:table-cell">Alta</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {usuarios.map((usuario) => (
          <TableRow key={usuario.id}>
            <TableCell>
              <Pila espacio={0}>
                <Fila espacio={2}>
                  <Texto variante="fuerte">{usuario.nombre}</Texto>
                  {usuario.id === idActual && <Insignia tono="advertencia">Vos</Insignia>}
                </Fila>
                {/* En el teléfono el email va debajo del nombre; en pantallas anchas tiene su columna. */}
                <Texto variante="chico" className="lg:hidden">
                  {usuario.email}
                </Texto>
                {/* En el teléfono, rol y estado van como insignias debajo, para que las acciones entren. */}
                <Fila espacio={1} className="mt-1 sm:hidden">
                  <InsigniaRol rol={usuario.rol} />
                  <InsigniaActivo activo={usuario.activo} />
                </Fila>
              </Pila>
            </TableCell>
            <TableCell className="hidden text-muted-foreground lg:table-cell">{usuario.email}</TableCell>
            <TableCell className="hidden sm:table-cell">
              <InsigniaRol rol={usuario.rol} />
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              <InsigniaActivo activo={usuario.activo} />
            </TableCell>
            <TableCell className="hidden text-muted-foreground xl:table-cell">{formatearFecha(usuario.createdAt)}</TableCell>
            <TableCell className="text-right">
              <AccionesUsuario usuario={usuario} esElMismo={usuario.id === idActual} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
