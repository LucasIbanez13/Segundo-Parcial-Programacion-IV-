import { formatearComprobante, formatearMoneda } from "@/components/clientes/base";
import { FORMAS_PAGO } from "@/lib/constants";

const FORMATO_HORA = new Intl.DateTimeFormat("es-AR", { hour: "2-digit", minute: "2-digit" });

function esDeHoy(fechaIso) {
  return new Date(fechaIso).toDateString() === new Date().toDateString();
}

// Indicadores calculados con el listado de ventas (no hay endpoint propio).
// "Hoy" es el día del navegador. `ventas` viene ordenado por fecha descendente.
export default function VentasStats({ ventas }) {
  const deHoy = ventas.filter((venta) => esDeHoy(venta.fecha));
  const totalHoy = deHoy.reduce((suma, venta) => suma + venta.totalCentavos, 0);
  const cuentaCorrienteHoy = deHoy
    .filter((venta) => venta.formaPago === FORMAS_PAGO.CUENTA_CORRIENTE)
    .reduce((suma, venta) => suma + venta.totalCentavos, 0);
  const ultima = ventas[0];

  const tarjetas = [
    {
      titulo: "Ventas de hoy",
      valor: formatearMoneda(totalHoy),
      nota: `${deHoy.length} ${deHoy.length === 1 ? "operación registrada" : "operaciones registradas"}`,
    },
    { titulo: "En cuenta corriente", valor: formatearMoneda(cuentaCorrienteHoy), nota: "Ventas de hoy" },
    {
      titulo: "Último comprobante",
      valor: ultima ? formatearComprobante(ultima.numero).slice(1) : "—",
      nota: ultima
        ? `${esDeHoy(ultima.fecha) ? "Hoy" : new Date(ultima.fecha).toLocaleDateString("es-AR")}, ${FORMATO_HORA.format(new Date(ultima.fecha))} h`
        : "Sin ventas todavía",
    },
  ];

  return (
    <div className="mb-[22px] grid grid-cols-3 gap-3.5 max-[550px]:grid-cols-1">
      {tarjetas.map(({ titulo, valor, nota }) => (
        <div key={titulo} className="rounded-[9px] border border-border bg-surface px-5 py-[19px]">
          <p className="mb-[9px] text-xs text-[#7b8b7e]">{titulo}</p>
          <strong className="font-serif text-[25px] font-normal text-[#294535]">{valor}</strong>
          <small className="mt-1.5 block text-[#8b998e]">{nota}</small>
        </div>
      ))}
    </div>
  );
}
