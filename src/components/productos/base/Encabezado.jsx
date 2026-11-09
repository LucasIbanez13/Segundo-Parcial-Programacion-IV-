// Encabezado de las pantallas de productos: breadcrumb, título, subtítulo y acción.
export default function Encabezado({ ruta, titulo, subtitulo, accion }) {
  return (
    <div className="mb-7 flex items-end justify-between gap-5 max-[550px]:flex-col max-[550px]:items-start">
      <div>
        <div className="mb-2 text-xs font-bold tracking-[1px] text-[#73877a] uppercase">{ruta}</div>
        <h1 className="font-serif text-[35px] leading-[1.1] font-normal tracking-[-1px] text-heading max-[850px]:text-[30px]">
          {titulo}
        </h1>
        <p className="mt-2 leading-normal text-muted">{subtitulo}</p>
      </div>
      {accion}
    </div>
  );
}
