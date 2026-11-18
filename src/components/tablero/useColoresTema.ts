"use client";

// Colores de los gráficos tomados de los tokens de globals.css, para que sigan la identidad visual y el modo
// oscuro. Chart.js dibuja en un canvas y no entiende variables CSS ni oklch(): el canvas los traduce a hex.
import { useEffect, useState } from "react";

const TOKENS = ["primary", "advertencia", "muted-foreground", "border", "foreground", "card"] as const;
type Token = (typeof TOKENS)[number];
export type ColoresTema = Record<Token, string>;

const POR_DEFECTO: ColoresTema = {
  primary: "#2b4a8b",
  advertencia: "#b7791f",
  "muted-foreground": "#6b7280",
  border: "#e5e7eb",
  foreground: "#1f2937",
  card: "#ffffff",
};

// Pinta un píxel con el color y lee su RGB: así cualquier formato (oklch, hsl…) queda en hex.
// Si el color es transparente (el borde del modo oscuro), se devuelve en rgba para conservarlo.
function aHex(contexto: CanvasRenderingContext2D, color: string, porDefecto: string): string {
  contexto.clearRect(0, 0, 1, 1);
  contexto.fillStyle = porDefecto;
  contexto.fillStyle = color;
  contexto.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = contexto.getImageData(0, 0, 1, 1).data;
  if (a < 255) return `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(2)})`;
  return `#${[r, g, b].map((canal) => canal.toString(16).padStart(2, "0")).join("")}`;
}

function leerColores(): ColoresTema {
  const estilos = getComputedStyle(document.documentElement);
  const lienzo = document.createElement("canvas");
  lienzo.width = lienzo.height = 1;
  const contexto = lienzo.getContext("2d", { willReadFrequently: true });
  if (!contexto) return POR_DEFECTO;
  const colores = { ...POR_DEFECTO };
  for (const token of TOKENS) {
    const valor = estilos.getPropertyValue(`--${token}`).trim();
    if (valor) colores[token] = aHex(contexto, valor, POR_DEFECTO[token]);
  }
  return colores;
}

// Vuelve a leer los colores si cambia el tema (clase "dark" en <html>) o la preferencia del sistema.
export function useColoresTema(): ColoresTema {
  const [colores, setColores] = useState<ColoresTema>(POR_DEFECTO);

  useEffect(() => {
    const actualizar = () => setColores(leerColores());
    actualizar();
    const observador = new MutationObserver(actualizar);
    observador.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style"] });
    const medio = window.matchMedia("(prefers-color-scheme: dark)");
    medio.addEventListener("change", actualizar);
    return () => {
      observador.disconnect();
      medio.removeEventListener("change", actualizar);
    };
  }, []);

  return colores;
}

// El mismo color con transparencia (hex de 6 dígitos → rgba).
export function conAlfa(hex: string, alfa: number): string {
  const limpio = hex.replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(limpio)) return hex;
  const [r, g, b] = [0, 2, 4].map((inicio) => parseInt(limpio.slice(inicio, inicio + 2), 16));
  return `rgba(${r}, ${g}, ${b}, ${alfa})`;
}
