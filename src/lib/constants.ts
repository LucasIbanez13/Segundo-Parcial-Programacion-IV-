// Constantes del dominio. Sin dependencias del servidor: se usan también en el navegador.

// Datos del comercio: la marca de la aplicación y el encabezado del comprobante (RF-V7) y del recibo (RF-C5).
export const DATOS_COMERCIO = {
  nombre: "Celulares el Tucu",
  rubro: "Celulares y accesorios",
  direccion: "25 de Mayo 300, San Miguel de Tucumán",
  telefono: "(381) 123-4567",
} as const;

// Roles del sistema (enunciado, sección 3).
export const ROLES = ["admin", "vendedor"] as const;
export type Rol = (typeof ROLES)[number];

export const ETIQUETAS_ROL: Record<Rol, string> = {
  admin: "Administrador",
  vendedor: "Vendedor",
};

// Tipos de movimiento de stock (sección 7). Venta y egreso restan; ingreso y anulación suman.
export const TIPOS_MOVIMIENTO_STOCK = ["venta", "anulacion", "ingreso", "egreso"] as const;
export type TipoMovimientoStock = (typeof TIPOS_MOVIMIENTO_STOCK)[number];

export const ETIQUETAS_TIPO_MOVIMIENTO: Record<TipoMovimientoStock, string> = {
  venta: "Venta",
  anulacion: "Anulación",
  ingreso: "Ingreso",
  egreso: "Egreso",
};

// Motivos de los movimientos manuales (sección 11.4, POST /api/productos/{id}/movimientos).
export const MOTIVOS_INGRESO = ["Reposición", "Stock inicial", "Devolución de cliente"] as const;
export const MOTIVOS_EGRESO = ["Rotura", "Vencimiento", "Ajuste de inventario", "Uso interno"] as const;
export const MOTIVO_STOCK_INICIAL = "Stock inicial";

// Clientes (RF-C2): tipo de documento.
export const TIPOS_DOC = ["DNI", "CUIT"] as const;
export type TipoDoc = (typeof TIPOS_DOC)[number];

// Pagos (RF-C5, sección 11.5): medio de pago del recibo.
export const MEDIOS_PAGO = ["efectivo", "transferencia", "tarjeta_debito"] as const;
export type MedioPago = (typeof MEDIOS_PAGO)[number];

export const ETIQUETAS_MEDIO_PAGO: Record<MedioPago, string> = {
  efectivo: "Efectivo",
  transferencia: "Transferencia",
  tarjeta_debito: "Tarjeta de débito",
};

// Movimientos de cuenta corriente (sección 7): el débito suma deuda y el crédito la descuenta.
export const TIPOS_MOVIMIENTO_CUENTA = ["debito", "credito"] as const;
export type TipoMovimientoCuenta = (typeof TIPOS_MOVIMIENTO_CUENTA)[number];

// Punto de venta de los recibos de pago (regla 4: numeración propia, "R 0001-00000001").
export const PUNTO_VENTA_RECIBOS = 1;

// Facturas (RF-V5, sección 11.6): forma de pago, tipo de tarjeta y estado.
export const FORMAS_PAGO = ["contado", "tarjeta", "cuenta_corriente"] as const;
export type FormaPago = (typeof FORMAS_PAGO)[number];

export const ETIQUETAS_FORMA_PAGO: Record<FormaPago, string> = {
  contado: "Contado",
  tarjeta: "Tarjeta",
  cuenta_corriente: "Cuenta corriente",
};

export const TIPOS_TARJETA = ["debito", "credito"] as const;
export type TipoTarjeta = (typeof TIPOS_TARJETA)[number];

export const ETIQUETAS_TIPO_TARJETA: Record<TipoTarjeta, string> = { debito: "Débito", credito: "Crédito" };

export const ESTADOS_FACTURA = ["emitida", "anulada"] as const;
export type EstadoFactura = (typeof ESTADOS_FACTURA)[number];

// Punto de venta de las facturas (regla 4: "0001-00000001").
export const PUNTO_VENTA_FACTURAS = 1;

// Paginación de listados (sección 11.1).
export const PAGINA_TAMANO_POR_DEFECTO = 20;
export const PAGINA_TAMANO_MAXIMO = 100;

// Contraseñas: bcrypt solo usa los primeros 72 bytes.
export const PASSWORD_MINIMO = 8;
export const PASSWORD_MAXIMO_BYTES = 72;

// Duración de la sesión: después hay que volver a ingresar.
export const DURACION_SESION_MS = 8 * 60 * 60 * 1000;
export const NOMBRE_COOKIE_SESION = "mostrador_sesion";
