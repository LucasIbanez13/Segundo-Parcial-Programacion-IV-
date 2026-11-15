// Constantes del dominio. Sin dependencias del servidor: se usan también en el navegador.

// Roles del sistema (enunciado, sección 3).
export const ROLES = ["admin", "vendedor"] as const;
export type Rol = (typeof ROLES)[number];

export const ETIQUETAS_ROL: Record<Rol, string> = {
  admin: "Administrador",
  vendedor: "Vendedor",
};

// Paginación de listados (sección 11.1).
export const PAGINA_TAMANO_POR_DEFECTO = 20;
export const PAGINA_TAMANO_MAXIMO = 100;

// Contraseñas: bcrypt solo usa los primeros 72 bytes.
export const PASSWORD_MINIMO = 8;
export const PASSWORD_MAXIMO_BYTES = 72;

// Duración de la sesión: después hay que volver a ingresar.
export const DURACION_SESION_MS = 8 * 60 * 60 * 1000;
export const NOMBRE_COOKIE_SESION = "mostrador_sesion";
