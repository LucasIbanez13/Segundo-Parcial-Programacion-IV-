// Estructura general de la app: sidebar a la izquierda, barra superior y contenido.
// La usan el layout del dashboard (con usuario) y la pantalla de login (sin usuario).
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function Marco({ usuario = null, children }) {
  return (
    <div className="grid min-h-screen grid-cols-[235px_minmax(0,1fr)] max-[850px]:grid-cols-[minmax(0,1fr)] max-[850px]:grid-rows-[auto_1fr]">
      <Sidebar mostrarUsuarios={!usuario || usuario.administrador} />
      <main className="min-w-0">
        <Header usuario={usuario} />
        <div className="mx-auto max-w-[1500px] p-[38px] max-[850px]:px-5 max-[850px]:py-[25px] max-[550px]:px-[15px] max-[550px]:py-[22px]">
          {children}
        </div>
      </main>
    </div>
  );
}
