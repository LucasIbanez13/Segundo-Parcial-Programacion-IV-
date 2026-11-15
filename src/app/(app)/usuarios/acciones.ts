"use server";

// Server Actions del módulo Usuarios (sección 10.3). Llaman a los mismos servicios que la API REST:
// la verificación de rol y las reglas viven en usuarios.service, no acá.
import { revalidatePath } from "next/cache";
import { accion } from "@/lib/http/accion";
import { crearUsuario, editarUsuario, restablecerPassword } from "@/services/usuarios.service";

export const crearUsuarioAccion = accion(async (usuario, datos: unknown) => {
  const nuevo = await crearUsuario(usuario, datos);
  revalidatePath("/usuarios");
  return nuevo;
});

export const editarUsuarioAccion = accion(async (usuario, id: number, datos: unknown) => {
  const editado = await editarUsuario(usuario, id, datos);
  revalidatePath("/usuarios");
  return editado;
});

export const restablecerPasswordAccion = accion(async (usuario, id: number) => restablecerPassword(usuario, id));
