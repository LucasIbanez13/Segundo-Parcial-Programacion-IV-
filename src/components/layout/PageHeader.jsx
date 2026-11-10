// Encabezado de página: breadcrumb, título, subtítulo y acción principal.
export default function PageHeader({ ruta, titulo, subtitulo, accion = null }) {
  return (
    <div className="mb-7 flex items-end justify-between gap-5 max-[550px]:flex-col max-[550px]:items-start">
      <div>
        {ruta && <div className="mb-2 text-[10px] font-extrabold tracking-[1.4px] text-[#73877a] uppercase">{ruta}</div>}
        <h1 className="font-serif text-[35px] leading-[1.1] font-normal tracking-[-1px] text-heading max-[850px]:text-[30px]">
          {titulo}
        </h1>
        {subtitulo && <p className="mt-2 leading-normal text-muted">{subtitulo}</p>}
      </div>
      {accion}
    </div>
  );
}
