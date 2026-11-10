// Lógica de clientes. Contrato: docs/02-api-rest.md (Clientes)
import { CODIGOS_ERROR, ErrorApi } from "@/lib/errors";
import { MENSAJE_SIN_CONTACTO } from "@/lib/validations/cliente";
import * as clientesRepository from "@/repositories/clientes.repository";

export function errorClienteNoEncontrado() {
  return new ErrorApi(404, CODIGOS_ERROR.NO_ENCONTRADO, "El cliente no existe.");
}

export function listarClientes(filtros) {
  return clientesRepository.listarClientes(filtros);
}

export async function obtenerCliente(id) {
  const cliente = await clientesRepository.obtenerClientePorId(id);
  if (!cliente) throw errorClienteNoEncontrado();
  return cliente;
}

// Un cliente nuevo todavía no tiene ventas ni pagos.
export async function crearCliente(datos) {
  const cliente = await clientesRepository.crearCliente(datos);
  return { ...cliente, saldoCentavos: 0 };
}

// No modifica comprobantes anteriores: las ventas guardan su propia copia del nombre y documento.
export async function modificarCliente(id, cambios) {
  const actual = await obtenerCliente(id);

  // Un PATCH vacío es válido: no hay nada para actualizar.
  if (Object.keys(cambios).length === 0) return actual;

  // Se valida el objeto resultante: lo enviado más lo que el cliente ya tenía.
  const telefono = cambios.telefono !== undefined ? cambios.telefono : actual.telefono;
  const correo = cambios.correo !== undefined ? cambios.correo : actual.correo;
  if (!telefono && !correo) {
    throw new ErrorApi(422, CODIGOS_ERROR.VALIDACION, MENSAJE_SIN_CONTACTO, {
      errores: [{ campo: "telefono", mensaje: MENSAJE_SIN_CONTACTO }],
    });
  }

  await clientesRepository.actualizarCliente(id, cambios);
  return obtenerCliente(id);
}
