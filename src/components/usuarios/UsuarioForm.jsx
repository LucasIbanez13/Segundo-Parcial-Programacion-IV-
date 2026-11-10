"use client";

// Formulario alta / edición de usuario. En edición no hay contraseña (su cambio queda fuera de alcance).
// Valida con los mismos esquemas zod que el servidor para avisar enseguida; la autoridad es la API.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { actualizarUsuarioSchema, crearUsuarioSchema } from "@/lib/validations/usuario";
import { AVISO_ERROR, BOTON_PRIMARIO, BOTON_SECUNDARIO, claseControl, PANEL } from "./estilos";

const VALORES_INICIALES = {
  nombre: "",
  acceso: "",
  contrasena: "",
  confirmacion: "",
  administrador: "false",
  activo: "true",
};

function valoresDeUsuario(usuario) {
  return {
    nombre: usuario.nombre,
    acceso: usuario.acceso,
    administrador: String(usuario.administrador),
    activo: String(usuario.activo),
  };
}

function primerErrorPorCampo(problemas) {
  const errores = {};
  for (const { campo, mensaje } of problemas) {
    if (campo && !errores[campo]) errores[campo] = mensaje;
  }
  return errores;
}

function Campo({ etiqueta, error, completo = false, children }) {
  return (
    <label className={`block min-w-0 text-xs font-bold text-[#52675b] ${completo ? "col-span-full" : ""}`}>
      {etiqueta}
      {children}
      {error && (
        <span role="alert" className="mt-1.5 block text-[13px] leading-normal font-normal text-danger">
          {error}
        </span>
      )}
    </label>
  );
}

// Alta de usuario, o edición si recibe `usuario`.
export default function UsuarioForm({ usuario = null }) {
  const router = useRouter();
  const esEdicion = usuario !== null;
  const [valores, setValores] = useState(esEdicion ? valoresDeUsuario(usuario) : VALORES_INICIALES);
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState("");
  const [enviando, setEnviando] = useState(false);

  function cambiar(evento) {
    const { name, value } = evento.target;
    setValores((actuales) => ({ ...actuales, [name]: value }));
    setErrores((actuales) => ({ ...actuales, [name]: undefined }));
  }

  function prepararDatos() {
    const datos = {
      nombre: valores.nombre,
      acceso: valores.acceso,
      administrador: valores.administrador === "true",
      activo: valores.activo === "true",
    };
    if (!esEdicion) datos.contrasena = valores.contrasena;

    const resultado = (esEdicion ? actualizarUsuarioSchema : crearUsuarioSchema).safeParse(datos);
    const erroresLocales = resultado.success
      ? {}
      : primerErrorPorCampo(resultado.error.issues.map((p) => ({ campo: p.path.join("."), mensaje: p.message })));

    // La confirmación solo existe en la interfaz: al servidor se manda una sola contraseña.
    if (!esEdicion && !erroresLocales.contrasena && valores.confirmacion !== valores.contrasena) {
      erroresLocales.confirmacion = "Las contraseñas no coinciden.";
    }
    return { datos, erroresLocales };
  }

  async function enviar(evento) {
    evento.preventDefault();
    if (enviando) return;
    setErrorGeneral("");

    const { datos, erroresLocales } = prepararDatos();
    if (Object.keys(erroresLocales).length > 0) {
      setErrores(erroresLocales);
      return;
    }

    setErrores({});
    setEnviando(true);
    try {
      const respuesta = await fetch(esEdicion ? `/api/usuarios/${usuario.id}` : "/api/usuarios", {
        method: esEdicion ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });

      if (respuesta.ok) {
        router.push(`/usuarios?aviso=${esEdicion ? "usuario-actualizado" : "usuario-creado"}`);
        router.refresh();
        return;
      }
      if (respuesta.status === 401) {
        window.location.assign("/login");
        return;
      }

      const { error } = (await respuesta.json().catch(() => null)) ?? {};
      if (error?.codigo === "ACCESO_DUPLICADO") {
        setErrores({ acceso: error.mensaje });
      } else if (error?.detalles?.errores?.some((e) => e.campo)) {
        setErrores(primerErrorPorCampo(error.detalles.errores));
      } else {
        setErrorGeneral(error?.mensaje ?? "Ocurrió un error inesperado. Probá de nuevo.");
      }
    } catch {
      setErrorGeneral("No pudimos conectarnos con el servidor. Revisá tu conexión.");
    }
    setEnviando(false);
  }

  return (
    <div className="grid grid-cols-[minmax(0,700px)_minmax(220px,320px)] items-start gap-[22px] max-[850px]:grid-cols-1">
      {/* noValidate: los errores se muestran debajo de cada campo con los mensajes propios. */}
      <form onSubmit={enviar} noValidate className={PANEL}>
        <div className="border-b border-[#edf0eb] px-[22px] py-5 max-[550px]:p-[17px]">
          <h2 className="text-[15px] font-bold">Datos del usuario</h2>
          <p className="mt-1 text-xs text-[#829087]">
            {esEdicion ? "Modificá la información que sea necesaria." : "Completá los datos de identificación y acceso."}
          </p>
        </div>

        <div className="grid gap-5 p-[22px] max-[550px]:p-[17px]">
          <div className="grid grid-cols-2 gap-4 max-[550px]:grid-cols-1">
            <Campo etiqueta="Nombre y apellido" error={errores.nombre} completo>
              <input
                name="nombre"
                value={valores.nombre}
                onChange={cambiar}
                placeholder="Ej. Lucía Pérez"
                autoComplete="off"
                aria-invalid={Boolean(errores.nombre)}
                className={claseControl(errores.nombre)}
              />
            </Campo>
            <Campo etiqueta="Correo o nombre de acceso" error={errores.acceso} completo>
              <input
                name="acceso"
                value={valores.acceso}
                onChange={cambiar}
                placeholder="Ej. lucia@ejemplo.com"
                autoComplete="off"
                aria-invalid={Boolean(errores.acceso)}
                className={claseControl(errores.acceso)}
              />
            </Campo>
            {!esEdicion && (
              <>
                <Campo etiqueta="Contraseña" error={errores.contrasena}>
                  <input
                    name="contrasena"
                    type="password"
                    value={valores.contrasena}
                    onChange={cambiar}
                    autoComplete="new-password"
                    aria-invalid={Boolean(errores.contrasena)}
                    className={claseControl(errores.contrasena)}
                  />
                </Campo>
                <Campo etiqueta="Confirmar contraseña" error={errores.confirmacion}>
                  <input
                    name="confirmacion"
                    type="password"
                    value={valores.confirmacion}
                    onChange={cambiar}
                    autoComplete="new-password"
                    aria-invalid={Boolean(errores.confirmacion)}
                    className={claseControl(errores.confirmacion)}
                  />
                </Campo>
              </>
            )}
            <Campo etiqueta="Perfil" error={errores.administrador}>
              <select name="administrador" value={valores.administrador} onChange={cambiar} className={claseControl(errores.administrador)}>
                <option value="false">Operador</option>
                <option value="true">Administrador</option>
              </select>
            </Campo>
            <Campo etiqueta="Estado" error={errores.activo}>
              <select name="activo" value={valores.activo} onChange={cambiar} className={claseControl(errores.activo)}>
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </Campo>
          </div>

          {errorGeneral && (
            <div role="alert" className={AVISO_ERROR}>
              {errorGeneral}
            </div>
          )}

          <p className="text-[11px] leading-normal text-[#89968b]">
            {esEdicion
              ? "La contraseña actual no se muestra. El cambio de contraseña queda fuera de esta pantalla."
              : "La contraseña se guarda cifrada y nunca se vuelve a mostrar. Debe tener al menos 8 caracteres."}
          </p>
        </div>

        <div className="flex justify-end gap-2.5 border-t border-[#edf0eb] px-[22px] py-[18px] max-[550px]:flex-col-reverse">
          <Link href="/usuarios" className={BOTON_SECUNDARIO}>
            Cancelar
          </Link>
          <button type="submit" disabled={enviando} className={BOTON_PRIMARIO}>
            {enviando ? "Guardando…" : esEdicion ? "Guardar cambios" : "Crear usuario"}
          </button>
        </div>
      </form>

      <aside className="rounded-[9px] bg-help px-[22px] py-5 text-[13px] leading-[1.6] text-[#506958]">
        <h2 className="mb-2 text-sm font-bold text-[#294535]">{esEdicion ? "Estado del usuario" : "Acceso al sistema"}</h2>
        <p>
          {esEdicion
            ? "Una persona inactiva no podrá iniciar sesión y se cerrarán sus sesiones abiertas. Sus datos seguirán disponibles para la administración."
            : "Las personas activas podrán iniciar sesión. El administrador puede crear y administrar usuarios."}
        </p>
      </aside>
    </div>
  );
}
