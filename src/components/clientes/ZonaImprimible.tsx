// Lo que queda adentro es lo único que sale al imprimir (recibo, saldos): el panel lateral, la barra
// superior y los botones se ocultan. Se resuelve con esta regla porque el layout es compartido y no
// tiene estilos de impresión propios.
const ESTILO_IMPRESION = `@media print {
  body * { visibility: hidden; }
  [data-imprimible], [data-imprimible] * { visibility: visible; }
  [data-imprimible] { position: absolute; inset: 0 auto auto 0; width: 100%; }
}`;

export function ZonaImprimible({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div data-imprimible className={className}>
      <style>{ESTILO_IMPRESION}</style>
      {children}
    </div>
  );
}
