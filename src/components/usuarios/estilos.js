// Clases del mockup para el módulo de usuarios, hasta que estén implementados los componentes de src/components/ui/.

const FOCO = "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus";

const BOTON = `inline-block cursor-pointer rounded-[7px] px-4 py-[11px] text-center text-[15px] font-bold whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50 ${FOCO}`;

export const BOTON_PRIMARIO = `${BOTON} bg-primary text-white hover:bg-primary-hover`;
export const BOTON_SECUNDARIO = `${BOTON} border border-[#d4ded4] bg-surface text-[#355445] hover:bg-topbar`;
export const ENLACE = `cursor-pointer font-bold text-[#38654c] underline-offset-2 hover:underline ${FOCO}`;

export function claseControl(error) {
  return `mt-[7px] block h-[42px] w-full rounded-md border bg-[#fbfcf9] px-3 text-[15px] font-normal text-[#293b31] placeholder:text-[#a4afa6] ${FOCO} ${
    error ? "border-danger" : "border-[#dbe3da]"
  }`;
}

export const PANEL = "overflow-hidden rounded-[10px] border border-border bg-surface";
export const TABLA = "w-full border-collapse text-left whitespace-nowrap";
export const TH =
  "border-b border-[#edf0eb] bg-[#fafbf8] px-5 py-3.5 text-[10px] font-extrabold tracking-[.8px] text-[#8a988d] uppercase max-[550px]:px-[15px] max-[550px]:py-[13px]";
export const TD =
  "border-b border-[#edf0eb] px-5 py-3.5 text-[13px] max-[550px]:px-[15px] max-[550px]:py-[13px] [tr:last-child_&]:border-b-0";

export const AVISO_ERROR = "rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-[13px] leading-normal text-danger";
export const AVISO_EXITO =
  "rounded-lg border border-badge-ok/30 bg-badge-ok-bg px-4 py-3 text-[13px] leading-normal text-badge-ok";

export function etiquetaPerfil(administrador) {
  return administrador ? "Administrador/a" : "Operador/a";
}
