// Cuenta corriente del cliente: saldo, ventas en cta. cte., pagos e historial.
import CuentaCorriente from "@/components/clientes/CuentaCorriente";

const AVISOS = {
  "pago-registrado": "Pago registrado.",
};

export default async function CuentaCorrientePage({ params, searchParams }) {
  const [{ id }, { aviso }] = await Promise.all([params, searchParams]);

  return <CuentaCorriente id={id} avisoExito={AVISOS[aviso]} />;
}
