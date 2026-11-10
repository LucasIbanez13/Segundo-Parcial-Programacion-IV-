"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Aviso, BOTON_SECUNDARIO, contactoDe, Encabezado, PANEL, useConsultaApi } from "./base";
import CuentaCorrienteResumen from "./CuentaCorrienteResumen";
import MovimientosCuentaTable from "./MovimientosCuentaTable";

const VOLVER = (
  <Link href="/clientes" className={BOTON_SECUNDARIO}>
    ← Volver a clientes
  </Link>
);

// Pantalla de cuenta corriente: datos del cliente, movimientos y saldo.
export default function CuentaCorriente({ id, avisoExito }) {
  const base = `/api/clientes/${encodeURIComponent(id)}`;
  const consultaCliente = useConsultaApi(base);
  const consultaCuenta = useConsultaApi(`${base}/cuenta-corriente`);
  const cliente = consultaCliente.datos;
  const cuenta = consultaCuenta.datos;
  const error = consultaCliente.error ?? consultaCuenta.error;

  // Quita el aviso de la URL para que no reaparezca al recargar.
  useEffect(() => {
    if (avisoExito) window.history.replaceState(null, "", `/clientes/${id}`);
  }, [avisoExito, id]);

  function reintentar() {
    consultaCliente.reintentar();
    consultaCuenta.reintentar();
  }

  if (error) {
    return (
      <>
        <Encabezado ruta="Clientes / Cuenta corriente" titulo="Cuenta corriente" accion={VOLVER} />
        {error.status === 404 ? (
          <Aviso>Este cliente no existe. Volvé al listado para elegir otro.</Aviso>
        ) : (
          <Aviso onReintentar={reintentar}>{`No pudimos cargar la cuenta. ${error.message}`}</Aviso>
        )}
      </>
    );
  }

  if (!cliente || !cuenta) {
    return <p className="py-10 text-center text-[13px] text-muted">Cargando cuenta corriente…</p>;
  }

  return (
    <>
      <Encabezado
        ruta="Clientes / Cuenta corriente"
        titulo={cliente.nombre}
        subtitulo={[cliente.documento, contactoDe(cliente)].filter(Boolean).join(" · ")}
        accion={VOLVER}
      />
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(260px,360px)] items-start gap-[22px] max-[850px]:grid-cols-1">
        <div className="grid grid-cols-1 gap-[18px]">
          {avisoExito && <Aviso variante="exito">{avisoExito}</Aviso>}
          <section className={PANEL}>
            <div className="border-b border-[#edf0eb] px-[22px] py-5 max-[550px]:p-[17px]">
              <h2 className="text-[15px] font-bold">Movimientos de la cuenta</h2>
              <p className="mt-1 text-xs text-[#829087]">Ventas y pagos registrados.</p>
            </div>
            {cuenta.movimientos.length === 0 ? (
              <p className="px-5 py-10 text-center text-[13px] text-muted">
                Sin movimientos en cuenta corriente. Las ventas de contado o tarjeta no generan deuda.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <MovimientosCuentaTable movimientos={cuenta.movimientos} />
              </div>
            )}
          </section>
        </div>
        <CuentaCorrienteResumen clienteId={cliente.id} saldoCentavos={cuenta.saldoCentavos} />
      </div>
    </>
  );
}
