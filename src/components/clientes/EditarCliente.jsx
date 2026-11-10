"use client";

import { Aviso, useConsultaApi } from "./base";
import ClienteForm from "./ClienteForm";

// Carga el cliente y recién entonces muestra el formulario con sus datos.
export default function EditarCliente({ id }) {
  const { datos: cliente, error, cargando, reintentar } = useConsultaApi(`/api/clientes/${encodeURIComponent(id)}`);

  if (error) {
    return error.status === 404 ? (
      <Aviso>Este cliente no existe. Volvé al listado para elegir otro.</Aviso>
    ) : (
      <Aviso onReintentar={reintentar}>{`No pudimos cargar el cliente. ${error.message}`}</Aviso>
    );
  }
  if (cargando || !cliente) return <p className="py-10 text-center text-[13px] text-muted">Cargando cliente…</p>;

  return <ClienteForm cliente={cliente} />;
}
