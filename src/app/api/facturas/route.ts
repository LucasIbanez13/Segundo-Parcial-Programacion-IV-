// GET  /api/facturas — ambos. RF-V8. q, desde, hasta, clienteId, vendedorId, forma, estado y paginación; suma totalEmitido.
// POST /api/facturas — ambos. RF-V1 a RF-V6. 201 con la factura completa; 409 STOCK_INSUFICIENTE;
// 422 PRODUCTO_INACTIVO, CUENTA_CORRIENTE_NO_HABILITADA, LIMITE_CREDITO_EXCEDIDO, MONTO_INSUFICIENTE.
import { creado, ruta } from "@/lib/http/ruta";
import { emitirFactura, listarFacturas } from "@/services/facturas.service";

export const GET = ruta(async ({ usuario, query }) => listarFacturas(usuario, query));

export const POST = ruta(async ({ usuario, body }) => {
  const factura = await emitirFactura(usuario, body);
  return creado(factura, `/api/facturas/${factura.id}`);
});
