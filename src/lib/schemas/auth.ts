// Esquemas de autenticación (sección 11.3). Los usan el formulario de login, /perfil y auth.service.
import { z } from "zod";
import { passwordNueva } from "./comun";

const MENSAJE_CAMPOS_EXTRA = "La solicitud tiene campos que no corresponden.";

// RF-U1: inicio de sesión con email y contraseña.
export const loginSchema = z
  .object({
    email: z
      .string({ required_error: "Ingresá tu email.", invalid_type_error: "El email debe ser un texto." })
      .trim()
      .toLowerCase()
      .min(1, "Ingresá tu email.")
      .max(200, "El email es demasiado largo."),
    // La contraseña no se recorta: los espacios forman parte de ella.
    password: z
      .string({ required_error: "Ingresá tu contraseña.", invalid_type_error: "La contraseña debe ser un texto." })
      .min(1, "Ingresá tu contraseña.")
      .max(200, "La contraseña es demasiado larga."),
  })
  .strict(MENSAJE_CAMPOS_EXTRA);

// RF-U5: cada usuario cambia su propia contraseña (PUT /api/auth/password).
export const cambiarPasswordSchema = z
  .object({
    actual: z
      .string({ required_error: "Ingresá tu contraseña actual.", invalid_type_error: "La contraseña debe ser un texto." })
      .min(1, "Ingresá tu contraseña actual."),
    nueva: passwordNueva,
  })
  .strict(MENSAJE_CAMPOS_EXTRA)
  .refine((datos) => datos.actual !== datos.nueva, {
    path: ["nueva"],
    message: "La contraseña nueva tiene que ser distinta de la actual.",
  });

export type LoginEntrada = z.input<typeof loginSchema>;
export type CambiarPasswordEntrada = z.input<typeof cambiarPasswordSchema>;
