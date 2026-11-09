// Formato del módulo de productos. Se puede mover a src/lib/format.js cuando esté implementado.

const OPCIONES_MONEDA = { style: "currency", currency: "ARS", maximumFractionDigits: 2 };
const FORMATO_PESOS_ENTEROS = new Intl.NumberFormat("es-AR", { ...OPCIONES_MONEDA, minimumFractionDigits: 0 });
const FORMATO_CON_CENTAVOS = new Intl.NumberFormat("es-AR", { ...OPCIONES_MONEDA, minimumFractionDigits: 2 });

const FORMATO_FECHA = new Intl.DateTimeFormat("es-AR", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

// 650000 -> "$ 6.500" y 310050 -> "$ 3.100,50"
export function formatearMoneda(centavos) {
  const formato = centavos % 100 === 0 ? FORMATO_PESOS_ENTEROS : FORMATO_CON_CENTAVOS;
  return formato.format(centavos / 100);
}

// "2026-10-29T14:30:00Z" -> "29 oct 2026", en la zona horaria del navegador.
export function formatearFecha(fechaIso) {
  const partes = FORMATO_FECHA.formatToParts(new Date(fechaIso));
  const valor = (tipo) => partes.find((parte) => parte.type === tipo).value.replace(".", "");
  return `${valor("day")} ${valor("month")} ${valor("year")}`;
}

// 42 -> "#00042"
export function formatearComprobante(numero) {
  return `#${String(numero).padStart(5, "0")}`;
}

// Convierte lo que escribe el usuario a centavos, o null si no es un importe válido.
// Acepta "6500", "6500,50", "6500.50" y "6.500,50". Con formato argentino, "6.500" son seis mil quinientos.
// Opera con texto para evitar errores de redondeo: 19.99 * 100 da 1998.9999999999998.
export function pesosACentavos(texto) {
  const limpio = texto.trim().replace(/^\$\s*/, "");
  const conMiles = /^\d{1,3}(\.\d{3})+(,\d{1,2})?$/.test(limpio);
  if (!conMiles && !/^\d+([.,]\d{1,2})?$/.test(limpio)) return null;

  const normalizado = conMiles ? limpio.replaceAll(".", "") : limpio.replace(".", ",");
  const [entero, decimales = ""] = normalizado.split(",");
  const centavos = Number(entero) * 100 + Number(decimales.padEnd(2, "0"));
  return Number.isSafeInteger(centavos) ? centavos : null;
}

// 650050 -> "6500,50" y 650000 -> "6500", para cargar el campo de precio al editar.
export function centavosATextoPesos(centavos) {
  const pesos = Math.floor(centavos / 100);
  const resto = centavos % 100;
  return resto === 0 ? String(pesos) : `${pesos},${String(resto).padStart(2, "0")}`;
}
