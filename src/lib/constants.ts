// Constantes del dominio. Sin dependencias del servidor: se usan también en el navegador.

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

// Paginación de listados (sección 11.1).
export const PAGINA_TAMANO_POR_DEFECTO = 20;
export const PAGINA_TAMANO_MAXIMO = 100;

// Contraseñas: bcrypt solo usa los primeros 72 bytes.
export const PASSWORD_MINIMO = 8;
export const PASSWORD_MAXIMO_BYTES = 72;

// Duración de la sesión: después hay que volver a ingresar.
export const DURACION_SESION_MS = 8 * 60 * 60 * 1000;
export const NOMBRE_COOKIE_SESION = "mostrador_sesion";
