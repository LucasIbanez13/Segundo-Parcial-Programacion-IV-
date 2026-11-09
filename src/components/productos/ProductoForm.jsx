"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { actualizarProductoSchema, crearProductoSchema } from "@/lib/validations/producto";
import Campo from "./base/Campo";
import PanelFormulario from "./base/PanelFormulario";
import { claseControl } from "./base/estilos";
import { erroresDeCampos, pedirApi, validarEnCliente } from "./clienteApi";
import { centavosATextoPesos, pesosACentavos } from "./formato";

const VALORES_INICIALES = { codigo: "", nombre: "", precioVentaCentavos: "", stockInicial: "0", activo: "true" };

function valoresDeProducto(producto) {
  return {
    codigo: producto.codigo,
    nombre: producto.nombre,
    precioVentaCentavos: centavosATextoPesos(producto.precioVentaCentavos),
    activo: String(producto.activo),
  };
}

// Alta de producto, o edición si recibe `producto`.
export default function ProductoForm({ producto = null }) {
  const router = useRouter();
  const esEdicion = producto !== null;
  const [valores, setValores] = useState(esEdicion ? valoresDeProducto(producto) : VALORES_INICIALES);
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState(null);
  const [enviando, setEnviando] = useState(false);

  function cambiar(evento) {
    const { name, value } = evento.target;
    setValores((actuales) => ({ ...actuales, [name]: value }));
    setErrores((actuales) => ({ ...actuales, [name]: undefined }));
  }

  function prepararDatos() {
    const centavos = pesosACentavos(valores.precioVentaCentavos);
    const campos = {
      codigo: valores.codigo,
      nombre: valores.nombre,
      precioVentaCentavos: centavos ?? Number.NaN,
      activo: valores.activo === "true",
    };
    if (!esEdicion) campos.stockInicial = valores.stockInicial === "" ? Number.NaN : Number(valores.stockInicial);

    const resultado = validarEnCliente(esEdicion ? actualizarProductoSchema : crearProductoSchema, campos);
    if (centavos === null) {
      resultado.errores.precioVentaCentavos = "Ingresá un precio válido, por ejemplo 6500,50.";
    }
    return resultado;
  }

  function mostrarErrorDelServidor(error) {
    if (error.codigo === "CODIGO_DUPLICADO") {
      setErrores({ codigo: error.message });
      return;
    }
    const porCampo = erroresDeCampos(error);
    if (Object.keys(porCampo).length > 0) setErrores(porCampo);
    else setErrorGeneral(error.message);
  }

  async function enviar(evento) {
    evento.preventDefault();
    if (enviando) return;
    setErrorGeneral(null);

    const { datos, errores: erroresLocales } = prepararDatos();
    if (Object.keys(erroresLocales).length > 0) {
      setErrores(erroresLocales);
      return;
    }

    setErrores({});
    setEnviando(true);
    try {
      await pedirApi(esEdicion ? `/api/productos/${producto.id}` : "/api/productos", {
        metodo: esEdicion ? "PATCH" : "POST",
        cuerpo: datos,
      });
      router.push(`/productos?aviso=${esEdicion ? "producto-actualizado" : "producto-creado"}`);
    } catch (error) {
      mostrarErrorDelServidor(error);
      setEnviando(false);
    }
  }

  return (
    <PanelFormulario
      titulo="Datos del producto"
      subtitulo={
        esEdicion ? "Modificá la información que sea necesaria." : "Completá la información para identificarlo y venderlo."
      }
      ayudaTitulo={esEdicion ? "Historial de ventas" : "Sobre el stock inicial"}
      ayuda={
        esEdicion
          ? "Los cambios en el nombre o precio no modifican los comprobantes ya registrados."
          : "Indicá las unidades disponibles al dar de alta el producto. Después podrás registrar entradas y salidas desde Productos y stock."
      }
      errorGeneral={errorGeneral}
      textoEnviar={esEdicion ? "Guardar cambios" : "Guardar producto"}
      textoEnviando="Guardando…"
      enviando={enviando}
      onSubmit={enviar}
    >
      <Campo etiqueta="Código" error={errores.codigo}>
        <input
          name="codigo"
          value={valores.codigo}
          onChange={cambiar}
          placeholder="Ej. CAF-002"
          aria-invalid={Boolean(errores.codigo)}
          className={claseControl(errores.codigo)}
        />
      </Campo>
      <Campo etiqueta="Nombre" error={errores.nombre}>
        <input
          name="nombre"
          value={valores.nombre}
          onChange={cambiar}
          placeholder="Ej. Café en granos 500 g"
          aria-invalid={Boolean(errores.nombre)}
          className={claseControl(errores.nombre)}
        />
      </Campo>
      <Campo etiqueta="Precio de venta ($)" error={errores.precioVentaCentavos}>
        <input
          name="precioVentaCentavos"
          inputMode="decimal"
          value={valores.precioVentaCentavos}
          onChange={cambiar}
          placeholder="0,00"
          aria-invalid={Boolean(errores.precioVentaCentavos)}
          className={claseControl(errores.precioVentaCentavos)}
        />
      </Campo>
      {esEdicion ? (
        <Campo etiqueta="Stock actual" nota="Para modificar las existencias, registrá una entrada o salida de stock.">
          <input value={producto.stockActual} readOnly className={claseControl(null, { soloLectura: true })} />
        </Campo>
      ) : (
        <Campo etiqueta="Stock inicial" error={errores.stockInicial}>
          <input
            name="stockInicial"
            type="number"
            min="0"
            step="1"
            value={valores.stockInicial}
            onChange={cambiar}
            aria-invalid={Boolean(errores.stockInicial)}
            className={claseControl(errores.stockInicial)}
          />
        </Campo>
      )}
      <Campo etiqueta="Estado" error={errores.activo}>
        <select name="activo" value={valores.activo} onChange={cambiar} className={claseControl(errores.activo)}>
          <option value="true">Activo</option>
          <option value="false">Inactivo</option>
        </select>
      </Campo>
    </PanelFormulario>
  );
}
