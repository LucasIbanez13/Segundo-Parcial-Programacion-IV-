// Tabla de usuarios: nombre, acceso, perfil, estado, editar.
import Link from "next/link";
import { ENLACE, etiquetaPerfil, TABLA, TD, TH } from "./estilos";

const BADGE = "inline-block rounded-[5px] px-2 py-[5px] text-[11px] font-bold";

export default function UsuariosTable({ usuarios }) {
  return (
    <table className={TABLA}>
      <thead>
        <tr>
          <th className={TH}>Usuario</th>
          <th className={TH}>Acceso</th>
          <th className={TH}>Perfil</th>
          <th className={TH}>Estado</th>
          <th className={TH} aria-label="Acciones" />
        </tr>
      </thead>
      <tbody>
        {usuarios.map((usuario) => (
          <tr key={usuario.id}>
            <td className={`${TD} font-bold text-[#2c4436]`}>{usuario.nombre}</td>
            <td className={TD}>{usuario.acceso}</td>
            <td className={TD}>{etiquetaPerfil(usuario.administrador)}</td>
            <td className={TD}>
              {usuario.activo ? (
                <span className={`${BADGE} bg-badge-ok-bg text-badge-ok`}>Activo</span>
              ) : (
                <span className={`${BADGE} bg-badge-neutral-bg text-badge-neutral`}>Inactivo</span>
              )}
            </td>
            <td className={TD}>
              <Link href={`/usuarios/${usuario.id}/editar`} className={ENLACE}>
                Editar
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
