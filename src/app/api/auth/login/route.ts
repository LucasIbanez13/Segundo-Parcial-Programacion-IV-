// POST /api/auth/login — público. RF-U1.
// 200 con { id, nombre, email, rol } y la cookie de sesión; 401 CREDENCIALES_INVALIDAS.
import { guardarCookieSesion } from "@/lib/auth/sesion";
import { ruta } from "@/lib/http/ruta";
import { iniciarSesion } from "@/services/auth.service";

export const POST = ruta(
  async ({ body }) => {
    const usuario = await iniciarSesion(body);
    await guardarCookieSesion(usuario.id);
    return usuario;
  },
  { publica: true },
);
