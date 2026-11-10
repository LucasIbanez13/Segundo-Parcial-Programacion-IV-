"use client";

import { useEffect, useRef, useState } from "react";
import {
  Aviso,
  BOTON_PRIMARIO,
  BOTON_SECUNDARIO,
  Campo,
  claseControl,
  erroresDeCampos,
  pedirApi,
  validarEnCliente,
} from "@/components/clientes/base";
import { crearClienteSchema } from "@/lib/validations/cliente";

const VALORES_INICIALES = { nombre: "", documento: "", telefono: "", correo: "" };

const CAMPOS = [
  { nombre: "nombre", etiqueta: "Nombre y apellido o razón social", placeholder: "Ej. María González", completo: true },
  { nombre: "documento", etiqueta: "Documento o identificación", placeholder: "Ej. 28.456.123" },
  { nombre: "telefono", etiqueta: "Teléfono (opcional)", placeholder: "Ej. 381 555-0123", tipo: "tel" },
  { nombre: "correo", etiqueta: "Correo electrónico (opcional)", placeholder: "nombre@ejemplo.com", tipo: "email", completo: true },
];

// Alta rápida de cliente desde la venta: la venta en curso no se pierde porque no se cambia de pantalla.
// Usa el mismo POST /api/clientes que la pantalla de clientes.
export default function NuevoClienteModal({ abierto, onCerrar, onCreado }) {
  const dialogo = useRef(null);
  const [valores, setValores] = useState(VALORES_INICIALES);
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const elemento = dialogo.current;
    if (abierto && !elemento.open) {
      setValores(VALORES_INICIALES);
      setErrores({});
      setErrorGeneral(null);
      elemento.showModal();
    } else if (!abierto && elemento.open) {
      elemento.close();
    }
  }, [abierto]);

  function cambiar(evento) {
    const { name, value } = evento.target;
    setValores((actuales) => ({ ...actuales, [name]: value }));
    setErrores((actuales) => ({ ...actuales, [name]: undefined }));
  }

  async function enviar(evento) {
    evento.preventDefault();
    if (enviando) return;
    setErrorGeneral(null);

    const { datos, errores: erroresLocales } = validarEnCliente(crearClienteSchema, valores);
    if (!datos) {
      setErrores(erroresLocales);
      return;
    }

    setEnviando(true);
    try {
      const cliente = await pedirApi("/api/clientes", { metodo: "POST", cuerpo: datos });
      onCreado(cliente);
    } catch (error) {
      const porCampo = erroresDeCampos(error);
      if (Object.keys(porCampo).length > 0) setErrores(porCampo);
      else setErrorGeneral(error.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    // onClose cubre la tecla Escape, que cierra el <dialog> nativo.
    <dialog
      ref={dialogo}
      onClose={onCerrar}
      aria-labelledby="titulo-nuevo-cliente"
      className="m-auto w-[min(560px,calc(100vw-32px))] rounded-[10px] border border-border bg-surface p-0 text-ink backdrop:bg-[#1d3930]/40"
    >
      <form onSubmit={enviar} noValidate>
        <div className="border-b border-[#edf0eb] px-[22px] py-5">
          <h2 id="titulo-nuevo-cliente" className="text-[15px] font-bold">
            Nuevo cliente
          </h2>
          <p className="mt-1 text-xs text-[#829087]">Al guardarlo queda seleccionado en la venta.</p>
        </div>
        <div className="grid gap-5 p-[22px]">
          <div className="grid grid-cols-2 gap-4 max-[550px]:grid-cols-1">
            {CAMPOS.map((campo) => (
              <Campo key={campo.nombre} etiqueta={campo.etiqueta} error={errores[campo.nombre]} completo={campo.completo}>
                <input
                  name={campo.nombre}
                  type={campo.tipo ?? "text"}
                  value={valores[campo.nombre]}
                  onChange={cambiar}
                  placeholder={campo.placeholder}
                  aria-invalid={Boolean(errores[campo.nombre])}
                  className={claseControl(errores[campo.nombre])}
                />
              </Campo>
            ))}
          </div>
          <p className="text-xs text-muted">Completá al menos un teléfono o un correo electrónico.</p>
          {errorGeneral && <Aviso>{errorGeneral}</Aviso>}
        </div>
        <div className="flex justify-end gap-2.5 border-t border-[#edf0eb] px-[22px] py-[18px] max-[550px]:flex-col-reverse">
          <button type="button" onClick={onCerrar} className={BOTON_SECUNDARIO}>
            Cancelar
          </button>
          <button type="submit" disabled={enviando} className={BOTON_PRIMARIO}>
            {enviando ? "Guardando…" : "Guardar cliente"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
