// Nombre de la cookie de sesión. Archivo aparte, sin dependencias del servidor, porque también
// lo usa src/middleware.js, que corre en Edge y no puede importar la conexión a la BD.
export const NOMBRE_COOKIE_SESION = "mostrador_sesion";
