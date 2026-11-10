"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Aviso, pedirApi, useConsultaApi, validarEnCliente } from "@/components/clientes/base";
import { FORMAS_PAGO } from "@/lib/constants";
import { crearVentaSchema } from "@/lib/validations/venta";
import AgregarProducto from "./AgregarProducto";
import ClienteSelector from "./ClienteSelector";
import ItemsVentaTable from "./ItemsVentaTable";
import NuevoClienteModal from "./NuevoClienteModal";
import Panel from "./Panel";
import ResumenVenta from "./ResumenVenta";

// Cantidad escrita por el usuario -> entero positivo, o null si no es válida.
function leerCantidad(texto) {
  return /^[1-9]\d*$/.test(texto) ? Number(texto) : null;
}

// Contenedor de la venta: cliente, carrito y forma de pago. Todo queda en el estado de esta pantalla
// (también al dar de alta un cliente) hasta que se confirma.
export default function NuevaVentaForm() {
  const router = useRouter();
  const consultaClientes = useConsultaApi("/api/clientes");
  const consultaProductos = useConsultaApi("/api/productos?activo=true");
  const clientes = consultaClientes.datos?.datos ?? [];
  const productos = consultaProductos.datos?.datos ?? [];

  const [clienteId, setClienteId] = useState(null);
  // [{ productoId, cantidad }] con la cantidad como texto, tal como está en el input.
  const [carrito, setCarrito] = useState([]);
  const [formaPago, setFormaPago] = useState(FORMAS_PAGO.CONTADO);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [error, setError] = useState(null);
  const [confirmando, setConfirmando] = useState(false);

  // Precio y stock salen del catálogo cargado; si se recarga, la tabla muestra los valores nuevos.
  const items = carrito
    .map(({ productoId, cantidad }) => {
      const producto = productos.find((actual) => actual.id === productoId);
      if (!producto) return null;
      const numero = leerCantidad(cantidad);
      return {
        producto,
        cantidad,
        numero,
        subtotalCentavos: numero === null ? null : numero * producto.precioVentaCentavos,
      };
    })
    .filter(Boolean);

  const errores = {};
  for (const item of items) {
    if (item.numero === null) errores[item.producto.id] = "Ingresá una cantidad entera mayor a cero.";
    else if (item.numero > item.producto.stockActual) {
      errores[item.producto.id] = `Solo hay ${item.producto.stockActual} en stock.`;
    }
  }

  const unidades = items.reduce((suma, item) => suma + (item.numero ?? 0), 0);
  const totalCentavos = items.reduce((suma, item) => suma + (item.subtotalCentavos ?? 0), 0);
  const permiteCuentaCorriente = clienteId !== null;

  function cambiarCliente(id) {
    setClienteId(id);
    // Cuenta corriente exige cliente registrado: al pasar a consumidor final se vuelve a contado.
    if (id === null && formaPago === FORMAS_PAGO.CUENTA_CORRIENTE) setFormaPago(FORMAS_PAGO.CONTADO);
    setError(null);
  }

  // Si el producto ya está en la venta, suma una unidad (un renglón por producto).
  function agregarProducto(producto) {
    setCarrito((actual) => {
      const existente = actual.find((item) => item.productoId === producto.id);
      if (!existente) return [...actual, { productoId: producto.id, cantidad: "1" }];
      const cantidad = (leerCantidad(existente.cantidad) ?? 0) + 1;
      return actual.map((item) => (item.productoId === producto.id ? { ...item, cantidad: String(cantidad) } : item));
    });
    setError(null);
  }

  function cambiarCantidad(productoId, cantidad) {
    setCarrito((actual) => actual.map((item) => (item.productoId === productoId ? { ...item, cantidad } : item)));
    setError(null);
  }

  function quitarProducto(productoId) {
    setCarrito((actual) => actual.filter((item) => item.productoId !== productoId));
    setError(null);
  }

  function clienteCreado(cliente) {
    consultaClientes.setDatos((actual) => ({
      datos: [...(actual?.datos ?? []), cliente].sort((a, b) => a.nombre.localeCompare(b.nombre, "es")),
    }));
    setClienteId(cliente.id);
    setModalAbierto(false);
  }

  async function confirmar() {
    if (confirmando) return;
    setError(null);

    if (Object.keys(errores).length > 0) {
      setError("Revisá las cantidades marcadas antes de confirmar.");
      return;
    }

    const { datos, errores: problemas } = validarEnCliente(crearVentaSchema, {
      clienteId,
      formaPago,
      productos: items.map((item) => ({ productoId: item.producto.id, cantidad: item.numero })),
    });
    if (!datos) {
      setError(Object.values(problemas)[0]);
      return;
    }

    setConfirmando(true);
    try {
      const venta = await pedirApi("/api/ventas", { metodo: "POST", cuerpo: datos });
      router.push(`/ventas/${venta.id}?aviso=venta-registrada`);
    } catch (problema) {
      // Stock insuficiente, producto inactivo o inexistente: la venta sigue cargada para corregirla
      // y se recarga el catálogo para mostrar el stock actualizado.
      setError(problema.message);
      if (["STOCK_INSUFICIENTE", "PRODUCTO_INACTIVO", "NO_ENCONTRADO"].includes(problema.codigo)) {
        consultaProductos.reintentar();
      }
      setConfirmando(false);
    }
  }

  const errorCarga = consultaClientes.error ?? consultaProductos.error;

  return (
    <>
      {errorCarga && (
        <div className="mb-[18px]">
          <Aviso
            onReintentar={() => {
              consultaClientes.reintentar();
              consultaProductos.reintentar();
            }}
          >
            {`No pudimos cargar clientes o productos. ${errorCarga.message}`}
          </Aviso>
        </div>
      )}
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(280px,380px)] items-start gap-[22px] max-[850px]:grid-cols-1">
        <div className="grid grid-cols-1 gap-[22px]">
          <ClienteSelector
            clientes={clientes}
            clienteId={clienteId}
            onCambiar={cambiarCliente}
            onNuevoCliente={() => setModalAbierto(true)}
            cargando={consultaClientes.cargando && !consultaClientes.datos}
          />

          <Panel
            titulo="Productos"
            subtitulo="Agregá los artículos de la venta."
            accion={
              <span className="rounded-[5px] bg-badge-neutral-bg px-2 py-[5px] text-[11px] font-bold text-badge-neutral">
                {`${items.length} ${items.length === 1 ? "artículo" : "artículos"}`}
              </span>
            }
          >
            <div className="p-[22px] max-[550px]:p-[17px]">
              <AgregarProducto
                productos={productos}
                onAgregar={agregarProducto}
                cargando={consultaProductos.cargando && !consultaProductos.datos}
              />
            </div>
            {items.length === 0 ? (
              <p className="border-t border-[#edf0eb] px-5 py-10 text-center text-[13px] text-muted">
                Agregá al menos un producto para preparar la venta.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <ItemsVentaTable
                  items={items}
                  errores={errores}
                  onCambiarCantidad={cambiarCantidad}
                  onQuitar={quitarProducto}
                />
              </div>
            )}
          </Panel>
        </div>

        <ResumenVenta
          unidades={unidades}
          totalCentavos={totalCentavos}
          formaPago={formaPago}
          onCambiarFormaPago={setFormaPago}
          permiteCuentaCorriente={permiteCuentaCorriente}
          error={error}
          puedeConfirmar={items.length > 0}
          confirmando={confirmando}
          onConfirmar={confirmar}
        />
      </div>

      <NuevoClienteModal abierto={modalAbierto} onCerrar={() => setModalAbierto(false)} onCreado={clienteCreado} />
    </>
  );
}
