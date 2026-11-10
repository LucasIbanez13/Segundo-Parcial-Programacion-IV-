"use client";

// Botón 'Cerrar sesión': invalida la sesión en el servidor y vuelve a /login.
import { useState } from "react";

export default function LogoutButton() {
  const [cerrando, setCerrando] = useState(false);

  async function cerrarSesion() {
    setCerrando(true);
    try {
      await fetch("/api/sesion", { method: "DELETE" });
    } catch {
      // Sin conexión: igual se lleva a /login. El servidor descarta la sesión cuando expira.
    }
    // Navegación completa para que no quede nada de la sesión anterior en memoria.
    window.location.assign("/login");
  }

  return (
    <button
      type="button"
      onClick={cerrarSesion}
      disabled={cerrando}
      className="cursor-pointer whitespace-nowrap text-[#38654c] hover:underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-wait disabled:opacity-60"
    >
      {cerrando ? "Cerrando sesión…" : "Cerrar sesión"}
    </button>
  );
}
