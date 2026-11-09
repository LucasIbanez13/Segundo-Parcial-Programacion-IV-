"use client";

import Aviso from "./base/Aviso";
import ProductoForm from "./ProductoForm";
import { useConsultaApi } from "./useConsultaApi";

// Carga el producto y recién entonces muestra el formulario con sus datos.
export default function EditarProducto({ id }) {
  const { datos: producto, error, cargando, reintentar } = useConsultaApi(`/api/productos/${encodeURIComponent(id)}`);

  if (error) {
    return error.status === 404 ? (
      <Aviso>Este producto no existe. Volvé al listado para elegir otro.</Aviso>
    ) : (
      <Aviso onReintentar={reintentar}>{`No pudimos cargar el producto. ${error.message}`}</Aviso>
    );
  }
  if (cargando || !producto) return <p className="py-10 text-center text-[13px] text-muted">Cargando producto…</p>;

  return <ProductoForm producto={producto} />;
}
