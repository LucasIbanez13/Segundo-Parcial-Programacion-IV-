// Etiqueta de un control, con su mensaje de error y una nota opcional.
export default function Campo({ etiqueta, error, nota, completo = false, children }) {
  return (
    <label className={`block text-xs font-bold text-[#52675b] ${completo ? "col-span-full" : ""}`}>
      {etiqueta}
      {children}
      {nota && <span className="mt-1.5 block font-normal text-muted">{nota}</span>}
      {error && (
        <span role="alert" className="mt-1.5 block text-[13px] leading-normal font-normal text-danger">
          {error}
        </span>
      )}
    </label>
  );
}
