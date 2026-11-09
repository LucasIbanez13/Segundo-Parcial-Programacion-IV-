// Clases del mockup para este módulo, hasta que estén implementados los componentes de src/components/ui/.

const FOCO = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

const BOTON = `inline-block cursor-pointer rounded-[7px] px-4 py-[11px] text-center text-[15px] font-bold whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50 ${FOCO}`;

export const BOTON_PRIMARIO = `${BOTON} bg-primary text-white hover:bg-primary-hover`;
export const BOTON_SECUNDARIO = `${BOTON} border border-[#d4ded4] bg-surface text-[#355445] hover:bg-topbar`;
export const ENLACE = `cursor-pointer font-bold text-primary underline-offset-2 hover:underline ${FOCO}`;

const CONTROL = `mt-[7px] block w-full rounded-md border px-3 text-[15px] font-normal placeholder:text-[#a4afa6] ${FOCO}`;
const EDITABLE = "bg-[#fbfcf9] text-[#293b31]";
const SOLO_LECTURA = "cursor-not-allowed bg-background text-muted";

export function claseControl(error, { soloLectura = false } = {}) {
  return `${CONTROL} h-[42px] ${soloLectura ? SOLO_LECTURA : EDITABLE} ${error ? "border-danger" : "border-[#dbe3da]"}`;
}

export function claseAreaTexto(error) {
  return `${CONTROL} min-h-24 py-2.5 ${EDITABLE} ${error ? "border-danger" : "border-[#dbe3da]"}`;
}

export const TABLA = "w-full border-collapse text-left whitespace-nowrap";
export const TH =
  "border-b border-[#edf0eb] bg-[#fafbf8] px-5 py-3.5 text-[10px] font-extrabold tracking-[.8px] text-[#8a988d] uppercase max-[550px]:px-[15px] max-[550px]:py-[13px]";
export const TD = "border-b border-[#edf0eb] px-5 py-3.5 text-[13px] max-[550px]:px-[15px] max-[550px]:py-[13px]";
export const PANEL = "overflow-hidden rounded-[10px] border border-border bg-surface";
