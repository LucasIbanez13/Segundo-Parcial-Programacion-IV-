// Único módulo de formatos (sección 10.6): moneda, fecha, hora y numeración.
// Los componentes no formatean por su cuenta: siempre pasan por acá.

const ZONA_ARGENTINA = "America/Argentina/Buenos_Aires";

const formatoMoneda = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// 1234550 centavos -> "$ 12.345,50" (regla 10).
export function formatearMoneda(centavos: number): string {
  return formatoMoneda.format(centavos / 100).replace(/ /g, " ");
}

const formatoFecha = new Intl.DateTimeFormat("es-AR", {
  timeZone: ZONA_ARGENTINA,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const formatoHora = new Intl.DateTimeFormat("es-AR", {
  timeZone: ZONA_ARGENTINA,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function aFecha(valor: string | Date): Date {
  return typeof valor === "string" ? new Date(valor) : valor;
}

// "29/10/2026" en hora de Argentina.
export function formatearFecha(valor: string | Date): string {
  return formatoFecha.format(aFecha(valor));
}

// "15:24" en hora de Argentina.
export function formatearHora(valor: string | Date): string {
  return formatoHora.format(aFecha(valor));
}

// "29/10/2026 15:24".
export function formatearFechaHora(valor: string | Date): string {
  return `${formatearFecha(valor)} ${formatearHora(valor)}`;
}

// Punto de venta y número: (1, 1233) -> "0001-00001233" (regla 4).
export function formatearNumeroComprobante(puntoVenta: number, numero: number): string {
  return `${String(puntoVenta).padStart(4, "0")}-${String(numero).padStart(8, "0")}`;
}

// "Laura Méndez" -> "LM".
export function iniciales(nombre: string): string {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((palabra) => palabra[0]!.toUpperCase())
    .join("");
}

// Centavos -> texto editable en un campo de importe: 1234550 -> "12345,50" (sin separador de miles).
export function centavosATextoEditable(centavos: number): string {
  return (centavos / 100).toFixed(2).replace(".", ",");
}

// Texto que escribe el usuario -> centavos enteros (regla 10). Acepta "12.345,50", "12345,5", "12345.50" y "$ 1.000".
// Devuelve undefined si está vacío y NaN si no es un importe válido: el esquema de Zod muestra el mensaje.
export function textoACentavos(texto: string): number | undefined {
  let limpio = texto.replace(/[$\s]/g, "");
  if (limpio === "") return undefined;
  if (limpio.includes(",")) limpio = limpio.replace(/\./g, "").replace(",", ".");
  else if (/^\d{1,3}(\.\d{3})+$/.test(limpio)) limpio = limpio.replace(/\./g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(limpio)) return Number.NaN;
  return Math.round(Number(limpio) * 100);
}

// Texto de un campo numérico entero -> número (undefined si está vacío, NaN si no es un número).
export function textoAEntero(texto: string): number | undefined {
  const limpio = texto.trim();
  if (limpio === "") return undefined;
  return /^-?\d+$/.test(limpio) ? Number(limpio) : Number.NaN;
}
