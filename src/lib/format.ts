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
