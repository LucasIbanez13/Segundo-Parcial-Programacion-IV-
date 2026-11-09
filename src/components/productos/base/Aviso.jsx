import { ENLACE } from "./estilos";

const VARIANTES = {
  error: "border-danger/30 bg-danger/5 text-danger",
  exito: "border-badge-ok/30 bg-badge-ok-bg text-badge-ok",
};

// Mensaje de error o confirmación, con opción de reintentar.
export default function Aviso({ variante = "error", children, onReintentar }) {
  return (
    <div
      role={variante === "error" ? "alert" : "status"}
      className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3 text-[13px] leading-normal ${VARIANTES[variante]}`}
    >
      <span>{children}</span>
      {onReintentar && (
        <button type="button" onClick={onReintentar} className={ENLACE}>
          Reintentar
        </button>
      )}
    </div>
  );
}
