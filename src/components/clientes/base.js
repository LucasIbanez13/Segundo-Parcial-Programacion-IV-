// Piezas del módulo de productos que también usa clientes (solo se importan, no se modifican).
// Cuando estén implementados src/components/ui/ y src/lib/format.js, conviene pasar a esos.
export { default as Aviso } from "@/components/productos/base/Aviso";
export { default as Campo } from "@/components/productos/base/Campo";
export { default as Encabezado } from "@/components/productos/base/Encabezado";
export {
  BOTON_PRIMARIO,
  BOTON_SECUNDARIO,
  claseAreaTexto,
  claseControl,
  ENLACE,
  PANEL,
  TABLA,
  TD,
  TH,
} from "@/components/productos/base/estilos";
export { erroresDeCampos, pedirApi, validarEnCliente } from "@/components/productos/clienteApi";
export { formatearComprobante, formatearFecha, formatearMoneda, pesosACentavos } from "@/components/productos/formato";
export { useConsultaApi } from "@/components/productos/useConsultaApi";

// Teléfono o correo, el que tenga (el correo primero, como en el mockup).
export function contactoDe(cliente) {
  return cliente.correo ?? cliente.telefono ?? "";
}
