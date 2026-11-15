// Esquemas de usuarios (sección 11.3). Compartidos por los formularios y por usuarios.service.
// .strict(): un campo no previsto (passwordHash, id, createdAt...) responde 422.
import { z } from "zod";
import { ROLES } from "@/lib/constants";
import { email, paginacion, passwordNueva, textoBusqueda, textoObligatorio } from "./comun";

const MENSAJE_CAMPOS_EXTRA = "La solicitud tiene campos que no se pueden enviar.";

const nombre = textoObligatorio("El nombre", 120);
const rol = z.enum(ROLES, { errorMap: () => ({ message: "Seleccioná un rol válido: admin o vendedor." }) });
const activo = z.boolean({ invalid_type_error: "El estado debe ser verdadero o falso." });

// POST /api/usuarios — RF-U4. La contraseña es temporal: la entrega el administrador.
export const crearUsuarioSchema = z
  .object({ nombre, email, rol, password: passwordNueva })
  .strict(MENSAJE_CAMPOS_EXTRA);

// PATCH /api/usuarios/{id} — RF-U4. Cualquiera de los campos; lo omitido conserva su valor.
export const editarUsuarioSchema = z
  .object({
    nombre: nombre.optional(),
    email: email.optional(),
    rol: rol.optional(),
    activo: activo.optional(),
  })
  .strict(MENSAJE_CAMPOS_EXTRA);

// GET /api/usuarios — q (nombre o email), activo (true | false | todos) y paginación.
// "todos" o sin el parámetro = activos e inactivos.
export const filtrosUsuariosSchema = paginacion.extend({
  q: textoBusqueda,
  activo: z
    .enum(["true", "false", "todos"], { errorMap: () => ({ message: "El filtro activo debe ser true, false o todos." }) })
    .optional()
    .transform((valor) => (valor === undefined || valor === "todos" ? undefined : valor === "true")),
});

export type CrearUsuarioEntrada = z.input<typeof crearUsuarioSchema>;
export type EditarUsuarioEntrada = z.input<typeof editarUsuarioSchema>;
export type FiltrosUsuarios = z.output<typeof filtrosUsuariosSchema>;
