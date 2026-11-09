"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { TIPOS_MOVIMIENTO } from "@/lib/constants";
import { crearMovimientoSchema } from "@/lib/validations/movimientoStock";
import Aviso from "./base/Aviso";
import Campo from "./base/Campo";
import PanelFormulario from "./base/PanelFormulario";
import { claseAreaTexto, claseControl } from "./base/estilos";
import { erroresDeCampos, pedirApi, validarEnCliente } from "./clienteApi";
import { useConsultaApi } from "./useConsultaApi";

const VALORES_INICIALES = { productoId: "", tipo: "", cantidad: "", motivo: "" };

// Entrada o salida manual de stock. El listado incluye productos inactivos.
export default function MovimientoStockForm() {
  const router = useRouter();
  const { datos, setDatos, error: errorCarga, cargando, reintentar } = useConsultaApi("/api/productos");
  const [valores, setValores] = useState(VALORES_INICIALES);
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const productos = datos?.datos ?? [];

  function cambiar(evento) {
    const { name, value } = evento.target;
    setValores((actuales) => ({ ...actuales, [name]: value }));
    setErrores((actuales) => ({ ...actuales, [name]: undefined }));
  }

  function prepararDatos() {
    const resultado = validarEnCliente(crearMovimientoSchema, {
      productoId: Number(valores.productoId),
      tipo: valores.tipo,
      cantidad: valores.cantidad === "" ? Number.NaN : Number(valores.cantidad),
      motivo: valores.motivo,
    });
    if (!valores.productoId) resultado.errores.productoId = "Seleccioná un producto.";
    if (!valores.tipo) resultado.errores.tipo = "Seleccioná una opción.";
    if (valores.cantidad === "") resultado.errores.cantidad = "Ingresá una cantidad.";
    return resultado;
  }

  // El stock pudo cambiar desde que se abrió la pantalla: se actualiza el selector con el valor real.
  function mostrarStockInsuficiente(error) {
    const { productoId, disponible } = error.detalles;
    setErrores({ cantidad: `${error.message} Disponible: ${disponible}.` });
    setDatos((actuales) => ({
      datos: actuales.datos.map((producto) =>
        producto.id === productoId ? { ...producto, stockActual: disponible } : producto,
      ),
    }));
  }

  async function enviar(evento) {
    evento.preventDefault();
    if (enviando) return;
    setErrorGeneral(null);

    const { datos: movimiento, errores: erroresLocales } = prepararDatos();
    if (Object.keys(erroresLocales).length > 0) {
      setErrores(erroresLocales);
      return;
    }

    setErrores({});
    setEnviando(true);
    try {
      await pedirApi("/api/movimientos-stock", { metodo: "POST", cuerpo: movimiento });
      router.push("/productos?aviso=movimiento-registrado");
    } catch (error) {
      if (error.codigo === "STOCK_INSUFICIENTE") {
        mostrarStockInsuficiente(error);
      } else {
        const porCampo = erroresDeCampos(error);
        if (Object.keys(porCampo).length > 0) setErrores(porCampo);
        else setErrorGeneral(error.message);
      }
      setEnviando(false);
    }
  }

  if (errorCarga && !datos) {
    return <Aviso onReintentar={reintentar}>{`No pudimos cargar los productos. ${errorCarga.message}`}</Aviso>;
  }

  return (
    <PanelFormulario
      titulo="Detalle del movimiento"
      subtitulo="Indicá el producto, la cantidad y el motivo."
      ayudaTitulo="Entradas y salidas"
      ayuda="Las entradas suman unidades y las salidas las descuentan. Una salida no puede dejar el stock en negativo."
      errorGeneral={errorGeneral}
      textoEnviar="Registrar movimiento"
      textoEnviando="Registrando…"
      enviando={enviando}
      onSubmit={enviar}
    >
      <Campo etiqueta="Producto" error={errores.productoId} completo>
        <select
          name="productoId"
          value={valores.productoId}
          onChange={cambiar}
          disabled={cargando}
          aria-invalid={Boolean(errores.productoId)}
          className={claseControl(errores.productoId)}
        >
          <option value="">{cargando ? "Cargando productos…" : "Seleccioná un producto"}</option>
          {productos.map((producto) => (
            <option key={producto.id} value={producto.id}>
              {`${producto.nombre} · Stock: ${producto.stockActual}${producto.activo ? "" : " · Inactivo"}`}
            </option>
          ))}
        </select>
      </Campo>
      <Campo etiqueta="Tipo de movimiento" error={errores.tipo}>
        <select
          name="tipo"
          value={valores.tipo}
          onChange={cambiar}
          aria-invalid={Boolean(errores.tipo)}
          className={claseControl(errores.tipo)}
        >
          <option value="">Seleccioná una opción</option>
          <option value={TIPOS_MOVIMIENTO.ENTRADA}>Entrada</option>
          <option value={TIPOS_MOVIMIENTO.SALIDA}>Salida</option>
        </select>
      </Campo>
      <Campo etiqueta="Cantidad" error={errores.cantidad}>
        <input
          name="cantidad"
          type="number"
          min="1"
          step="1"
          value={valores.cantidad}
          onChange={cambiar}
          placeholder="Ej. 5"
          aria-invalid={Boolean(errores.cantidad)}
          className={claseControl(errores.cantidad)}
        />
      </Campo>
      <Campo etiqueta="Motivo" error={errores.motivo} completo>
        <textarea
          name="motivo"
          value={valores.motivo}
          onChange={cambiar}
          placeholder="Ej. Ingreso de mercadería o ajuste de inventario"
          aria-invalid={Boolean(errores.motivo)}
          className={claseAreaTexto(errores.motivo)}
        />
      </Campo>
    </PanelFormulario>
  );
}
