"use client";

import { Aviso, useConsultaApi } from "./base";
import PagoForm from "./PagoForm";

// Carga el cliente (con su saldo) y recién entonces muestra el formulario de pago.
export default function NuevoPago({ id }) {
  const { datos: cliente, error, cargando, reintentar } = useConsultaApi(`/api/clientes/${encodeURIComponent(id)}`);

  if (error) {
    return error.status === 404 ? (
      <Aviso>Este cliente no existe. Volvé al listado para elegir otro.</Aviso>
    ) : (
      <Aviso onReintentar={reintentar}>{`No pudimos cargar el cliente. ${error.message}`}</Aviso>
    );
  }
  if (cargando || !cliente) return <p className="py-10 text-center text-[13px] text-muted">Cargando cliente…</p>;

  if (cliente.saldoCentavos <= 0) {
    return <Aviso variante="exito">{`${cliente.nombre} no tiene saldo pendiente: no hay pagos para registrar.`}</Aviso>;
  }

  return <PagoForm cliente={cliente} saldoCentavos={cliente.saldoCentavos} />;
}
