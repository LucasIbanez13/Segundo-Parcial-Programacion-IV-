// Esquemas zod de usuario: nombre, acceso, contrasena, administrador, activo (alta y PATCH).
// .strict() hace que un campo desconocido o de solo lectura (id, claveHash...) responda 422.
// En PATCH la contraseña no se acepta: su cambio queda fuera de alcance.
import { z } from "zod";
import { booleano, textoBusqueda, textoObligatorio } from "./comun.js";

const nombre = textoObligatorio("El nombre");
// Se guarda normalizado (trim + minúsculas), igual que exige el CHECK de la BD.
const acceso = textoObligatorio("El acceso").transform((texto) => texto.toLowerCase());
const administrador = booleano("El perfil");
const activo = booleano("El estado");

// bcrypt solo usa los primeros 72 bytes: más largo daría una falsa sensación de seguridad.
const contrasena = z
  .string({
    required_error: "La contraseña es obligatoria.",
    invalid_type_error: "La contraseña debe ser un texto.",
  })
  .min(8, "La contraseña debe tener al menos 8 caracteres.")
  .refine((texto) => new TextEncoder().encode(texto).length <= 72, "La contraseña es demasiado larga.");

const CAMPO_NO_PERMITIDO = "La solicitud tiene campos que no se pueden enviar.";

export const crearUsuarioSchema = z
  .object({ nombre, acceso, contrasena, administrador, activo })
  .strict(CAMPO_NO_PERMITIDO);

// Edición parcial: lo omitido conserva su valor.
export const actualizarUsuarioSchema = z
  .object({
    nombre: nombre.optional(),
    acceso: acceso.optional(),
    administrador: administrador.optional(),
    activo: activo.optional(),
  })
  .strict(CAMPO_NO_PERMITIDO);

// Query string de GET /api/usuarios.
export const filtrosUsuariosSchema = z.object({ q: textoBusqueda });
