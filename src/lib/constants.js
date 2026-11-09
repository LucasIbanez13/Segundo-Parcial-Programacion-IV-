// Constantes del negocio. Sin dependencias del servidor: se usan también en el navegador.

export const FORMAS_PAGO = Object.freeze({
  CONTADO: "CONTADO",
  TARJETA: "TARJETA",
  CUENTA_CORRIENTE: "CUENTA_CORRIENTE",
});

export const TIPOS_MOVIMIENTO = Object.freeze({
  ENTRADA: "ENTRADA",
  SALIDA: "SALIDA",
});

export const ORIGENES_MOVIMIENTO = Object.freeze({
  INICIAL: "INICIAL",
  MANUAL: "MANUAL",
  VENTA: "VENTA",
});

// Umbral ilustrativo, solo visual: no bloquea ninguna operación.
export const UMBRAL_STOCK_BAJO = 3;

export const CONSUMIDOR_FINAL = "Consumidor final";
