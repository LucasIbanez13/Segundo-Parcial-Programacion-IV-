// Indicadores: productos activos, con stock bajo y movimientos recientes.
// `estadisticas` es null si no se pudieron cargar: la pantalla sigue funcionando sin ellas.
export default function ProductosStats({ estadisticas }) {
  const tarjetas = [
    { titulo: "Productos activos", valor: estadisticas?.productosActivos, nota: "En el catálogo" },
    { titulo: "Con stock bajo", valor: estadisticas?.productosStockBajo, nota: "Para revisar" },
    { titulo: "Movimientos recientes", valor: estadisticas?.movimientosRecientes, nota: "Últimos 7 días" },
  ];

  return (
    <div className="mb-[22px] grid grid-cols-3 gap-3.5 max-[550px]:grid-cols-1">
      {tarjetas.map(({ titulo, valor, nota }) => (
        <div key={titulo} className="rounded-[9px] border border-border bg-surface px-5 py-[19px]">
          <p className="mb-[9px] text-xs text-[#7b8b7e]">{titulo}</p>
          <strong className="font-serif text-[25px] font-normal text-[#294535]">{valor ?? "—"}</strong>
          <small className="mt-1.5 block text-[#8b998e]">{estadisticas ? nota : "No disponible"}</small>
        </div>
      ))}
    </div>
  );
}
