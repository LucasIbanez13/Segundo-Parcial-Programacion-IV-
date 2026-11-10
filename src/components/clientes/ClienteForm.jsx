"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { crearClienteSchema } from "@/lib/validations/cliente";
import { Campo, claseControl, erroresDeCampos, pedirApi, validarEnCliente } from "./base";
import PanelFormulario from "./PanelFormulario";

const VALORES_INICIALES = { nombre: "", documento: "", telefono: "", correo: "" };

function valoresDeCliente(cliente) {
  return {
    nombre: cliente.nombre,
    documento: cliente.documento,
    telefono: cliente.telefono ?? "",
    correo: cliente.correo ?? "",
  };
}

// Alta de cliente, o edición si recibe `cliente`.
export default function ClienteForm({ cliente = null }) {
  const router = useRouter();
  const esEdicion = cliente !== null;
  const [valores, setValores] = useState(esEdicion ? valoresDeCliente(cliente) : VALORES_INICIALES);
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState(null);
  const [enviando, setEnviando] = useState(false);

  function cambiar(evento) {
    const { name, value } = evento.target;
    setValores((actuales) => ({ ...actuales, [name]: value }));
    setErrores((actuales) => ({ ...actuales, [name]: undefined }));
  }

  async function enviar(evento) {
    evento.preventDefault();
    if (enviando) return;
    setErrorGeneral(null);

    // En la edición también se mandan todos los campos: se valida el cliente completo.
    // Los contactos vacíos se convierten en null.
    const { datos, errores: erroresLocales } = validarEnCliente(crearClienteSchema, valores);
    if (!datos) {
      setErrores(erroresLocales);
      return;
    }

    setErrores({});
    setEnviando(true);
    try {
      await pedirApi(esEdicion ? `/api/clientes/${cliente.id}` : "/api/clientes", {
        metodo: esEdicion ? "PATCH" : "POST",
        cuerpo: datos,
      });
      router.push(`/clientes?aviso=${esEdicion ? "cliente-actualizado" : "cliente-creado"}`);
    } catch (error) {
      const porCampo = erroresDeCampos(error);
      if (Object.keys(porCampo).length > 0) setErrores(porCampo);
      else setErrorGeneral(error.message);
      setEnviando(false);
    }
  }

  return (
    <PanelFormulario
      titulo="Datos del cliente"
      subtitulo="Ingresá su identificación y al menos un dato de contacto."
      ayuda={
        esEdicion ? (
          <>
            <h2 className="mb-2 text-sm font-bold text-[#294535]">Comprobantes anteriores</h2>
            <p>Los cambios no modifican las ventas ya registradas: conservan los datos del momento de la venta.</p>
          </>
        ) : (
          <>
            <h2 className="mb-2 text-sm font-bold text-[#294535]">Cuenta corriente</h2>
            <p>Una vez registrado, el cliente podrá seleccionarse en una venta y utilizar su cuenta corriente.</p>
          </>
        )
      }
      errorGeneral={errorGeneral}
      textoEnviar={esEdicion ? "Guardar cambios" : "Guardar cliente"}
      enviando={enviando}
      volverA={esEdicion ? `/clientes/${cliente.id}` : "/clientes"}
      onSubmit={enviar}
    >
      <Campo etiqueta="Nombre y apellido o razón social" error={errores.nombre} completo>
        <input
          name="nombre"
          value={valores.nombre}
          onChange={cambiar}
          placeholder="Ej. María González"
          aria-invalid={Boolean(errores.nombre)}
          className={claseControl(errores.nombre)}
        />
      </Campo>
      <Campo etiqueta="Documento o identificación" error={errores.documento}>
        <input
          name="documento"
          value={valores.documento}
          onChange={cambiar}
          placeholder="Ej. 28.456.123"
          aria-invalid={Boolean(errores.documento)}
          className={claseControl(errores.documento)}
        />
      </Campo>
      <Campo
        etiqueta={
          <>
            Teléfono <span className="font-normal text-muted">(opcional)</span>
          </>
        }
        error={errores.telefono}
      >
        <input
          name="telefono"
          type="tel"
          value={valores.telefono}
          onChange={cambiar}
          placeholder="Ej. 381 555-0123"
          aria-invalid={Boolean(errores.telefono)}
          className={claseControl(errores.telefono)}
        />
      </Campo>
      <Campo
        etiqueta={
          <>
            Correo electrónico <span className="font-normal text-muted">(opcional)</span>
          </>
        }
        error={errores.correo}
        nota="Completá al menos un teléfono o un correo electrónico."
        completo
      >
        <input
          name="correo"
          type="email"
          value={valores.correo}
          onChange={cambiar}
          placeholder="nombre@ejemplo.com"
          aria-invalid={Boolean(errores.correo)}
          className={claseControl(errores.correo)}
        />
      </Campo>
    </PanelFormulario>
  );
}
