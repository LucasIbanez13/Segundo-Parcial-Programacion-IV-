"use client";

// Formulario de inicio de sesión (correo + contraseña).
// Valida con el mismo esquema que el servidor para avisar enseguida; la autoridad es la API.
import { useState } from "react";
import { iniciarSesionSchema } from "@/lib/validations/sesion";

const FOCO = "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus";
const BOTON = `inline-block cursor-pointer rounded-[7px] px-4 py-[11px] text-center font-bold whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50 ${FOCO}`;

function claseControl(conError) {
  return `mt-[7px] block h-[42px] w-full rounded-md border bg-[#fbfcf9] px-3 font-normal text-[#293b31] ${FOCO} ${
    conError ? "border-danger" : "border-[#dbe3da]"
  }`;
}

function primerErrorPorCampo(issues) {
  const errores = {};
  for (const problema of issues) {
    const campo = problema.path.join(".");
    if (!errores[campo]) errores[campo] = problema.message;
  }
  return errores;
}

export default function LoginForm({ destino = "/ventas/nueva" }) {
  const [valores, setValores] = useState({ acceso: "", contrasena: "" });
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState("");
  const [enviando, setEnviando] = useState(false);

  function cambiar(evento) {
    const { name, value } = evento.target;
    setValores((anteriores) => ({ ...anteriores, [name]: value }));
    setErrores((anteriores) => ({ ...anteriores, [name]: undefined }));
  }

  async function enviar(evento) {
    evento.preventDefault();
    setErrorGeneral("");

    const resultado = iniciarSesionSchema.safeParse(valores);
    if (!resultado.success) {
      setErrores(primerErrorPorCampo(resultado.error.issues));
      return;
    }

    setEnviando(true);
    try {
      const respuesta = await fetch("/api/sesion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(valores),
      });

      if (respuesta.ok) {
        // Navegación completa: el layout vuelve a leer la sesión nueva desde el servidor.
        window.location.assign(destino);
        return;
      }

      const datos = await respuesta.json().catch(() => null);
      if (respuesta.status === 422 && datos?.error?.detalles?.errores) {
        setErrores(primerErrorPorCampo(datos.error.detalles.errores.map((e) => ({ path: [e.campo], message: e.mensaje }))));
      }
      setErrorGeneral(datos?.error?.mensaje ?? "No pudimos iniciar la sesión. Probá de nuevo.");
    } catch {
      setErrorGeneral("No pudimos conectarnos con el servidor. Revisá tu conexión.");
    }
    setEnviando(false);
  }

  return (
    <form onSubmit={enviar} noValidate className="overflow-hidden rounded-[10px] border border-border bg-surface">
      <div className="border-b border-[#edf0eb] px-[22px] py-5 max-[550px]:p-[17px]">
        <h2 className="text-[15px] font-bold">Acceso al comercio</h2>
      </div>

      <div className="grid gap-5 p-[22px] max-[550px]:p-[17px]">
        <label className="block text-xs font-bold text-[#52675b]">
          Correo o nombre de acceso
          <input
            name="acceso"
            autoComplete="username"
            autoFocus
            value={valores.acceso}
            onChange={cambiar}
            disabled={enviando}
            aria-invalid={Boolean(errores.acceso)}
            className={claseControl(errores.acceso)}
          />
          {errores.acceso && (
            <span role="alert" className="mt-1.5 block text-[13px] font-normal text-danger">
              {errores.acceso}
            </span>
          )}
        </label>

        <label className="block text-xs font-bold text-[#52675b]">
          Contraseña
          <input
            name="contrasena"
            type="password"
            autoComplete="current-password"
            value={valores.contrasena}
            onChange={cambiar}
            disabled={enviando}
            aria-invalid={Boolean(errores.contrasena)}
            className={claseControl(errores.contrasena)}
          />
          {errores.contrasena && (
            <span role="alert" className="mt-1.5 block text-[13px] font-normal text-danger">
              {errores.contrasena}
            </span>
          )}
        </label>

        {errorGeneral && (
          <div role="alert" className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-[13px] leading-normal text-danger">
            {errorGeneral}
          </div>
        )}

        <p className="text-[11px] leading-normal text-[#89968b]">
          Si no tenés usuario o lo desactivaron, pedile acceso a un administrador.
        </p>
      </div>

      <div className="flex justify-end gap-2.5 border-t border-[#edf0eb] px-[22px] py-[18px] max-[550px]:flex-col">
        <button type="submit" disabled={enviando} className={`${BOTON} bg-primary text-white hover:bg-primary-hover`}>
          {enviando ? "Ingresando…" : "Ingresar"}
        </button>
      </div>
    </form>
  );
}
