// Importe abreviado para ejes y centros de gráficos: 15000000 centavos -> "$ 150 mil", 250000000 -> "$ 2,5 M".
export function pesosCompactos(centavos: number): string {
  const pesos = centavos / 100;
  if (pesos >= 1_000_000) return `$ ${(pesos / 1_000_000).toLocaleString("es-AR", { maximumFractionDigits: 1 })} M`;
  if (pesos >= 1_000) return `$ ${Math.round(pesos / 1_000).toLocaleString("es-AR")} mil`;
  return `$ ${Math.round(pesos).toLocaleString("es-AR")}`;
}
