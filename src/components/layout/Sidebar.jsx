"use client";

// Menú lateral: logo 'mostrador' + Ventas, Productos y stock, Clientes, Usuarios.
// En pantallas < 850px pasa a una barra horizontal arriba con scroll.
import Link from "next/link";
import { usePathname } from "next/navigation";

const SECCIONES = [
  { href: "/ventas", icono: "▤", texto: "Ventas" },
  { href: "/productos", icono: "▦", texto: "Productos y stock" },
  { href: "/clientes", icono: "♙", texto: "Clientes" },
  { href: "/usuarios", icono: "⚙", texto: "Usuarios", soloAdministrador: true },
];

// mostrarUsuarios: la sección Usuarios solo se ofrece a administradores
// (igual el servidor rechaza a los demás: ocultar el botón no alcanza).
export default function Sidebar({ mostrarUsuarios = true }) {
  const rutaActual = usePathname();
  const secciones = SECCIONES.filter((seccion) => mostrarUsuarios || !seccion.soloAdministrador);

  return (
    <aside className="flex flex-col gap-8 bg-sidebar px-[18px] py-[27px] text-[#e8f1e9] max-[850px]:min-w-0 max-[850px]:gap-3.5 max-[850px]:py-[15px]">
      <div className="flex items-center gap-3 text-xl font-bold tracking-[-.6px] max-[850px]:text-[17px]">
        <div className="grid size-9 place-items-center rounded-[10px] bg-accent font-extrabold text-sidebar">M</div>
        <div>
          mostrador
          <small className="mt-0.5 block text-[10px] tracking-[1.4px] text-[#adc5b5] uppercase max-[850px]:hidden">
            Gestión comercial
          </small>
        </div>
      </div>

      <div className="max-[850px]:min-w-0">
        <p className="mx-2.5 mb-2.5 text-[10px] font-extrabold tracking-[1.4px] text-[#99b3a2] uppercase max-[850px]:hidden">
          Espacio de trabajo
        </p>
        <nav aria-label="Secciones principales" className="grid gap-[5px] max-[850px]:flex max-[850px]:overflow-x-auto">
          {secciones.map(({ href, icono, texto }) => {
            const activa = rutaActual === href || rutaActual.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                aria-current={activa ? "page" : undefined}
                className={`rounded-lg px-[13px] py-3 font-semibold whitespace-nowrap hover:bg-sidebar-active hover:text-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus max-[850px]:p-[9px] ${
                  activa ? "bg-sidebar-active text-white" : "text-[#c6d7ca]"
                }`}
              >
                <span aria-hidden="true" className="inline-block w-7 text-[17px] max-[850px]:mr-[5px] max-[850px]:w-auto">
                  {icono}
                </span>
                {texto}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto border-t border-[#486255] px-2 pt-[18px] text-xs leading-[1.6] text-[#b5c9ba] max-[850px]:hidden">
        Un lugar para organizar
        <br />
        tu comercio, todos los días.
      </div>
    </aside>
  );
}
