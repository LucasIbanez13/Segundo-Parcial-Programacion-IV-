// Esquema zod del inicio de sesión. Sin dependencias del servidor: también lo usa el formulario.
import { z } from "zod";

export const iniciarSesionSchema = z
  .object({
    // Se normaliza igual que en la BD: sin espacios en los extremos y en minúsculas.
    acceso: z
      .string({
        required_error: "Ingresá tu correo o nombre de acceso.",
        invalid_type_error: "El acceso debe ser un texto.",
      })
      .trim()
      .min(1, "Ingresá tu correo o nombre de acceso.")
      .transform((acceso) => acceso.toLowerCase()),
    // La contraseña no se recorta: los espacios forman parte de ella.
    contrasena: z
      .string({
        required_error: "Ingresá tu contraseña.",
        invalid_type_error: "La contraseña debe ser un texto.",
      })
      .min(1, "Ingresá tu contraseña.")
      .max(200, "La contraseña es demasiado larga."),
  })
  .strict("La solicitud tiene campos que no corresponden.");
