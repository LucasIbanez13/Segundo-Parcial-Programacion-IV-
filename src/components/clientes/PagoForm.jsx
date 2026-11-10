"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { registrarPagoSchema } from "@/lib/validations/pago";
import {
  Campo,
  claseAreaTexto,
  claseControl,
  erroresDeCampos,
  formatearMoneda,
  pedirApi,
  pesosACentavos,
  validarEnCliente,
} from "./base";
import PanelFormulario from "./PanelFormulario";

// Fecha y hora local en el formato de <input type="datetime-local">: "2026-10-29T15:00".
function ahoraLocal() {
  const ahora = new Date();
  ahora.setMinutes(ahora.getMinutes() - ahora.getTimezoneOffset());
  return ahora.toISOString().slice(0, 16);
}

// Registrar un pago. El servidor vuelve a validar el saldo dentro de una transacción.
export default function PagoForm({ cliente, saldoCentavos }) {
  const router = useRouter();
  const [valores, setValores] = useState({ fecha: ahoraLocal(), importe: "", observacion: "" });
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState(null);
  const [enviando, setEnviando] = useState(false);

  function cambiar(evento) {
    const { name, value } = evento.target;
    setValores((actuales) => ({ ...actuales, [name]: value }));
    setErrores((actuales) => ({ ...actuales, [name]: undefined }));
  }

  function prepararDatos() {
    // datetime-local está en hora local: new Date() la interpreta así y toISOString() la pasa a UTC.
    const fecha = valores.fecha ? new Date(valores.fecha) : null;
    const centavos = pesosACentavos(valores.importe);
    const campos = {
      fecha: fecha && !Number.isNaN(fecha.getTime()) ? fecha.toISOString() : "",
      importeCentavos: centavos ?? Number.NaN,
      observacion: valores.observacion,
    };

    const { datos, errores: porCampo } = validarEnCliente(registrarPagoSchema, campos);
    const resultado = {
      datos,
      errores: { fecha: porCampo.fecha, importe: porCampo.importeCentavos, observacion: porCampo.observacion },
    };

    if (!campos.fecha) resultado.errores.fecha = "Ingresá la fecha del pago.";
    else if (fecha > new Date()) resultado.errores.fecha = "La fecha del pago no puede ser futura.";

    if (centavos === null) resultado.errores.importe = "Ingresá un importe válido, por ejemplo 5000,50.";
    else if (centavos > saldoCentavos) {
      resultado.errores.importe = `El pago no puede superar el saldo adeudado (${formatearMoneda(saldoCentavos)}).`;
    }
    return resultado;
  }

  async function enviar(evento) {
    evento.preventDefault();
    if (enviando) return;
    setErrorGeneral(null);

    const { datos, errores: erroresLocales } = prepararDatos();
    if (!datos || erroresLocales.fecha || erroresLocales.importe || erroresLocales.observacion) {
      setErrores(erroresLocales);
      return;
    }

    setErrores({});
    setEnviando(true);
    try {
      await pedirApi(`/api/clientes/${cliente.id}/pagos`, {
        metodo: "POST",
        cuerpo: { ...datos, fecha: datos.fecha.toISOString() },
      });
      router.push(`/clientes/${cliente.id}?aviso=pago-registrado`);
    } catch (error) {
      const porCampo = erroresDeCampos(error);
      if (porCampo.fecha || porCampo.importeCentavos) {
        setErrores({ fecha: porCampo.fecha, importe: porCampo.importeCentavos });
      } else {
        // Incluye PAGO_SUPERA_SALDO: otro pago pudo registrarse mientras se completaba el formulario.
        setErrorGeneral(error.message);
      }
      setEnviando(false);
    }
  }

  return (
    <PanelFormulario
      titulo="Datos del pago"
      subtitulo={`Pago de ${cliente.nombre} a cuenta de su saldo.`}
      ayuda={
        <>
          <h2 className="mb-2 text-sm font-bold text-[#294535]">Saldo actual</h2>
          <p className="mb-2 font-serif text-[28px] leading-none text-heading">{formatearMoneda(saldoCentavos)}</p>
          <p>El pago no puede superar el saldo adeudado.</p>
        </>
      }
      errorGeneral={errorGeneral}
      textoEnviar="Registrar pago"
      enviando={enviando}
      volverA={`/clientes/${cliente.id}`}
      onSubmit={enviar}
    >
      <Campo etiqueta="Fecha y hora" error={errores.fecha}>
        <input
          name="fecha"
          type="datetime-local"
          value={valores.fecha}
          max={ahoraLocal()}
          onChange={cambiar}
          aria-invalid={Boolean(errores.fecha)}
          className={claseControl(errores.fecha)}
        />
      </Campo>
      <Campo etiqueta="Importe ($)" error={errores.importe}>
        <input
          name="importe"
          inputMode="decimal"
          value={valores.importe}
          onChange={cambiar}
          placeholder="0,00"
          aria-invalid={Boolean(errores.importe)}
          className={claseControl(errores.importe)}
        />
      </Campo>
      <Campo
        etiqueta={
          <>
            Observación <span className="font-normal text-muted">(opcional)</span>
          </>
        }
        error={errores.observacion}
        completo
      >
        <textarea
          name="observacion"
          value={valores.observacion}
          onChange={cambiar}
          placeholder="Ej. Pago parcial"
          className={claseAreaTexto()}
        />
      </Campo>
    </PanelFormulario>
  );
}
