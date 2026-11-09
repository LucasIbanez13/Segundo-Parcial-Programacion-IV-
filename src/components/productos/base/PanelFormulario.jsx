import Link from "next/link";
import Aviso from "./Aviso";
import { BOTON_PRIMARIO, BOTON_SECUNDARIO, PANEL } from "./estilos";

// Estructura común de los formularios: panel con campos, acciones y ayuda lateral.
export default function PanelFormulario({
  titulo,
  subtitulo,
  ayudaTitulo,
  ayuda,
  errorGeneral,
  textoEnviar,
  textoEnviando,
  enviando,
  onSubmit,
  children,
}) {
  return (
    <div className="grid grid-cols-[minmax(0,700px)_minmax(220px,320px)] items-start gap-[22px] max-[850px]:grid-cols-1">
      {/* noValidate: los errores se muestran debajo de cada campo con los mensajes propios. */}
      <form onSubmit={onSubmit} noValidate className={PANEL}>
        <div className="border-b border-[#edf0eb] px-[22px] py-5 max-[550px]:p-[17px]">
          <h2 className="text-[15px] font-bold">{titulo}</h2>
          <p className="mt-1 text-xs text-[#829087]">{subtitulo}</p>
        </div>
        <div className="grid gap-5 p-[22px] max-[550px]:p-[17px]">
          <div className="grid grid-cols-2 gap-4 max-[550px]:grid-cols-1">{children}</div>
          {errorGeneral && <Aviso>{errorGeneral}</Aviso>}
        </div>
        <div className="flex justify-end gap-2.5 border-t border-[#edf0eb] px-[22px] py-[18px] max-[550px]:flex-col-reverse">
          <Link href="/productos" className={BOTON_SECUNDARIO}>
            Cancelar
          </Link>
          <button type="submit" disabled={enviando} className={BOTON_PRIMARIO}>
            {enviando ? textoEnviando : textoEnviar}
          </button>
        </div>
      </form>
      <aside className="rounded-[9px] bg-help px-[22px] py-5 text-[13px] leading-[1.6] text-[#506958]">
        <h2 className="mb-2 text-sm font-bold text-[#294535]">{ayudaTitulo}</h2>
        <p>{ayuda}</p>
      </aside>
    </div>
  );
}
