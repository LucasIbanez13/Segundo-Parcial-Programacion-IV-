import { PANEL } from "@/components/clientes/base";

// Panel blanco con título, subtítulo y una acción opcional a la derecha.
export default function Panel({ titulo, subtitulo, accion, children, className = "" }) {
  return (
    <section className={`${PANEL} ${className}`}>
      <div className="flex items-start justify-between gap-3 border-b border-[#edf0eb] px-[22px] py-5 max-[550px]:p-[17px]">
        <div>
          <h2 className="text-[15px] font-bold">{titulo}</h2>
          {subtitulo && <p className="mt-1 text-xs text-[#829087]">{subtitulo}</p>}
        </div>
        {accion}
      </div>
      {children}
    </section>
  );
}
