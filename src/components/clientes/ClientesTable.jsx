import Link from "next/link";
import { contactoDe, ENLACE, formatearMoneda, TABLA, TD, TH } from "./base";

// Tabla de clientes: nombre, documento, contacto, saldo, ver cuenta, editar.
export default function ClientesTable({ clientes }) {
  return (
    <table className={TABLA}>
      <thead>
        <tr>
          <th className={TH}>Cliente</th>
          <th className={TH}>Documento</th>
          <th className={TH}>Contacto</th>
          <th className={`${TH} text-right`}>Saldo adeudado</th>
          <th className={TH} aria-label="Acciones" />
          <th className={TH} aria-label="Edición" />
        </tr>
      </thead>
      <tbody>
        {clientes.map((cliente) => (
          <tr key={cliente.id}>
            <td className={`${TD} font-bold`}>{cliente.nombre}</td>
            <td className={TD}>{cliente.documento}</td>
            <td className={TD}>{contactoDe(cliente)}</td>
            <td className={`${TD} text-right`}>{formatearMoneda(cliente.saldoCentavos)}</td>
            <td className={TD}>
              <Link href={`/clientes/${cliente.id}`} className={ENLACE}>
                Ver cuenta →
              </Link>
            </td>
            <td className={TD}>
              <Link href={`/clientes/${cliente.id}/editar`} className={ENLACE}>
                Editar
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
