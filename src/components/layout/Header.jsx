// Barra superior: avatar, nombre, rol y 'Cerrar sesión'.
// Sin usuario (pantalla de login) se muestra la barra vacía.
import LogoutButton from "@/components/auth/LogoutButton";

function iniciales(nombre) {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((palabra) => palabra[0].toUpperCase())
    .join("");
}

export default function Header({ usuario = null }) {
  return (
    <header className="flex h-[67px] items-center justify-end border-b border-[#dfe4dc] bg-topbar px-[38px] text-[13px] text-[#6d7d72] max-[850px]:h-[52px] max-[850px]:px-5">
      {usuario && (
        <div className="flex min-w-0 items-center gap-2.5 font-bold text-[#334b3d]">
          <div aria-hidden="true" className="grid size-[31px] shrink-0 place-items-center rounded-full bg-[#dce8d7] text-[11px]">
            {iniciales(usuario.nombre)}
          </div>
          <span className="truncate">{usuario.nombre}</span>
          <span className="text-xs font-normal text-[#89968b] max-[550px]:hidden">
            {usuario.administrador ? "Administrador/a" : "Operador/a"}
          </span>
          <LogoutButton />
        </div>
      )}
    </header>
  );
}
