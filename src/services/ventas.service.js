// Lógica de ventas. Ver docs/02-api-rest.md (Registrar una venta)
// TODO: registrarVenta(datos, usuario) -> en UNA transacción:
//   1. agrupar productos repetidos y leer precios vigentes de la BD
//   2. validar existencia (404), activo (409), stock (409), cuenta corriente con cliente (422)
//   3. insertar venta (número por secuencia) y detalles con copias históricas
//   4. descontar stock con UPDATE condicional y registrar un movimiento SALIDA/VENTA por detalle
// TODO: listarVentas(), obtenerVenta(id).
