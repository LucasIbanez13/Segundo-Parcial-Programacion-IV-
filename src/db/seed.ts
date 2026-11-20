// Script de datos iniciales: pnpm run db:seed (RF-U3, sección 8 "Datos de prueba", sección 10.7).
// Carga la tienda de celulares "Celulares el Tucu": 2 usuarios, 5 categorías, 30 productos, 10 clientes,
// 50 facturas repartidas en los últimos 30 días, algunos pagos de cuenta corriente y 2 anulaciones.
//
// Todo se crea con los MISMOS servicios que usa la aplicación (nunca con inserts directos): así el stock,
// los saldos y la numeración cumplen todas las reglas, y el script sirve además como prueba de los servicios.
//
// Se corre sobre una base recién migrada. Si ya hay categorías cargadas, avisa y sale sin tocar nada.
// Contra una base remota (Turso) solo carga los datos de prueba si se pide explícitamente: pnpm run db:seed -- --remoto
import type { UsuarioSesion } from "@/lib/auth/permisos";
import { ApiError } from "@/lib/errors";
import { formatearMoneda } from "@/lib/format";
import type { FormaPago, MedioPago, TipoDoc } from "@/lib/constants";
import { iniciarSesion } from "@/services/auth.service";
import { crearCategoria, listarCategorias } from "@/services/categorias.service";
import { crearCliente, obtenerCliente } from "@/services/clientes.service";
import { anularFactura, emitirFactura } from "@/services/facturas.service";
import { registrarPago } from "@/services/pagos.service";
import { crearProducto, listarProductos } from "@/services/productos.service";
import { obtenerTablero } from "@/services/tablero.service";
import { crearUsuario } from "@/services/usuarios.service";

// ---------------------------------------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------------------------------------

// Actor con rol admin para crear los usuarios: todavía no hay nadie que pueda iniciar sesión.
// Solo se usa con crearUsuario, que no guarda quién lo hizo. Todo lo demás se hace con los usuarios reales.
const SISTEMA: UsuarioSesion = { id: 0, nombre: "Script de datos iniciales", email: "seed@sistema", rol: "admin" };

function leerVariable(nombre: string): string {
  const valor = process.env[nombre]?.trim();
  if (!valor) throw new Error(`Falta la variable ${nombre} en el archivo .env (ver .env.example).`);
  return valor;
}

// Generador pseudoaleatorio con semilla fija (mulberry32): cada corrida arma exactamente los mismos datos.
function crearAzar(semilla: number) {
  let estado = semilla >>> 0;
  const siguiente = () => {
    estado = (estado + 0x6d2b79f5) >>> 0;
    let t = estado;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    numero: siguiente,
    entero: (minimo: number, maximo: number) => minimo + Math.floor(siguiente() * (maximo - minimo + 1)),
    elegir: <T>(lista: readonly T[]) => lista[Math.floor(siguiente() * lista.length)],
  };
}
const azar = crearAzar(2026);

// Los servicios graban siempre la hora actual (new Date()): una factura real no se emite con otra fecha.
// Para repartir los datos de prueba en los últimos 30 días se simula el reloj SOLO mientras corre cada
// operación y se restaura enseguida. Así factura, renglones, movimientos de stock y de cuenta corriente
// quedan con la misma fecha, creados por las mismas reglas y transacciones que usa la aplicación.
const DateReal = Date;

async function conFecha<T>(momento: number, operacion: () => Promise<T>): Promise<T> {
  class DateSimulada extends DateReal {
    constructor(...argumentos: unknown[]) {
      // Sin argumentos es "ahora" (el momento simulado). Con argumentos funciona como siempre.
      super(...((argumentos.length === 0 ? [momento] : argumentos) as ConstructorParameters<typeof DateReal>));
    }
    static override now() {
      return momento;
    }
    // Las fechas creadas antes de simular el reloj siguen siendo "instanceof Date".
    static [Symbol.hasInstance](valor: unknown) {
      return valor instanceof DateReal;
    }
  }
  globalThis.Date = DateSimulada as unknown as DateConstructor;
  try {
    return await operacion();
  } finally {
    globalThis.Date = DateReal;
  }
}

const MINUTO = 60_000;
const HORA = 60 * MINUTO;
const DIA = 24 * HORA;
const DESFASE_ARGENTINA = 3 * HORA; // UTC−3, sin horario de verano.

// Medianoche (hora de Argentina) del día que está `diasAtras` días antes de hoy, en milisegundos UTC.
function inicioDelDia(ahora: number, diasAtras: number): number {
  return Math.floor((ahora - DESFASE_ARGENTINA) / DIA) * DIA + DESFASE_ARGENTINA - diasAtras * DIA;
}

const pesos = (importe: number) => Math.round(importe * 100); // $ → centavos (regla 10).

// ---------------------------------------------------------------------------------------------------------
// Catálogo
// ---------------------------------------------------------------------------------------------------------

type ProductoSemilla = {
  codigo: string;
  descripcion: string;
  precio: number; // centavos
  stockInicial: number;
  stockMinimo: number;
  popularidad: number; // peso para elegirlo en las ventas al azar
  reponer?: number; // productos que deben terminar bajo el mínimo: unidades a vender sí o sí
};

const CATALOGO: { categoria: string; productos: ProductoSemilla[] }[] = [
  {
    categoria: "Celulares",
    productos: [
      { codigo: "CEL-001", descripcion: "Samsung Galaxy A15 128 GB", precio: pesos(389_999), stockInicial: 14, stockMinimo: 3, popularidad: 5 },
      { codigo: "CEL-002", descripcion: "Samsung Galaxy A35 256 GB", precio: pesos(749_999), stockInicial: 8, stockMinimo: 2, popularidad: 2 },
      { codigo: "CEL-003", descripcion: "Motorola Moto G24 128 GB", precio: pesos(299_999), stockInicial: 15, stockMinimo: 3, popularidad: 5 },
      { codigo: "CEL-004", descripcion: "Motorola Edge 50 Fusion 256 GB", precio: pesos(829_999), stockInicial: 6, stockMinimo: 2, popularidad: 2 },
      { codigo: "CEL-005", descripcion: "Xiaomi Redmi Note 13 256 GB", precio: pesos(519_999), stockInicial: 10, stockMinimo: 3, popularidad: 3 },
      { codigo: "CEL-006", descripcion: "iPhone 13 128 GB", precio: pesos(1_299_999), stockInicial: 4, stockMinimo: 3, popularidad: 0, reponer: 2 },
    ],
  },
  {
    categoria: "Fundas y protectores",
    productos: [
      { codigo: "FUN-001", descripcion: "Funda de silicona Samsung Galaxy A15", precio: pesos(12_500), stockInicial: 40, stockMinimo: 8, popularidad: 6 },
      { codigo: "FUN-002", descripcion: "Funda de silicona Motorola Moto G24", precio: pesos(12_500), stockInicial: 35, stockMinimo: 8, popularidad: 5 },
      { codigo: "FUN-003", descripcion: "Funda de silicona iPhone 13", precio: pesos(18_900), stockInicial: 25, stockMinimo: 5, popularidad: 3 },
      { codigo: "FUN-004", descripcion: "Vidrio templado Samsung Galaxy A15", precio: pesos(7_500), stockInicial: 60, stockMinimo: 10, popularidad: 7 },
      { codigo: "FUN-005", descripcion: "Vidrio templado Xiaomi Redmi Note 13", precio: pesos(7_500), stockInicial: 45, stockMinimo: 10, popularidad: 5 },
      { codigo: "FUN-006", descripcion: "Vidrio templado iPhone 13", precio: pesos(9_900), stockInicial: 12, stockMinimo: 10, popularidad: 0, reponer: 4 },
    ],
  },
  {
    categoria: "Cargadores y cables",
    productos: [
      { codigo: "CAR-001", descripcion: "Cargador USB-C 20 W", precio: pesos(24_900), stockInicial: 15, stockMinimo: 12, popularidad: 0, reponer: 5 },
      { codigo: "CAR-002", descripcion: "Cargador USB-C 25 W carga rápida", precio: pesos(32_900), stockInicial: 30, stockMinimo: 6, popularidad: 5 },
      { codigo: "CAR-003", descripcion: "Cable USB-C a USB-C 1 m", precio: pesos(9_900), stockInicial: 70, stockMinimo: 15, popularidad: 8 },
      { codigo: "CAR-004", descripcion: "Cable Lightning a USB-C 1 m", precio: pesos(14_900), stockInicial: 30, stockMinimo: 6, popularidad: 3 },
      { codigo: "CAR-005", descripcion: "Cargador para auto doble USB", precio: pesos(15_900), stockInicial: 25, stockMinimo: 5, popularidad: 3 },
      { codigo: "CAR-006", descripcion: "Power bank 10.000 mAh", precio: pesos(39_900), stockInicial: 20, stockMinimo: 4, popularidad: 4 },
    ],
  },
  {
    categoria: "Auriculares",
    productos: [
      { codigo: "AUR-001", descripcion: "Auriculares in-ear con cable 3,5 mm", precio: pesos(8_900), stockInicial: 40, stockMinimo: 8, popularidad: 5 },
      { codigo: "AUR-002", descripcion: "Auriculares in-ear con cable USB-C", precio: pesos(13_900), stockInicial: 30, stockMinimo: 6, popularidad: 4 },
      { codigo: "AUR-003", descripcion: "Auriculares bluetooth TWS", precio: pesos(34_900), stockInicial: 30, stockMinimo: 6, popularidad: 6 },
      { codigo: "AUR-004", descripcion: "Auriculares bluetooth TWS con cancelación de ruido", precio: pesos(69_900), stockInicial: 15, stockMinimo: 3, popularidad: 2 },
      { codigo: "AUR-005", descripcion: "Auriculares vincha bluetooth", precio: pesos(45_900), stockInicial: 18, stockMinimo: 4, popularidad: 3 },
      { codigo: "AUR-006", descripcion: "Auriculares vincha gamer con micrófono", precio: pesos(52_900), stockInicial: 12, stockMinimo: 3, popularidad: 2 },
    ],
  },
  {
    categoria: "Repuestos",
    productos: [
      { codigo: "REP-001", descripcion: "Módulo de pantalla Samsung Galaxy A15", precio: pesos(89_900), stockInicial: 10, stockMinimo: 2, popularidad: 2 },
      { codigo: "REP-002", descripcion: "Módulo de pantalla Motorola Moto G24", precio: pesos(74_900), stockInicial: 10, stockMinimo: 2, popularidad: 2 },
      { codigo: "REP-003", descripcion: "Módulo de pantalla iPhone 13", precio: pesos(289_900), stockInicial: 3, stockMinimo: 2, popularidad: 0, reponer: 2 },
      { codigo: "REP-004", descripcion: "Batería Samsung Galaxy A15", precio: pesos(39_900), stockInicial: 15, stockMinimo: 3, popularidad: 2 },
      { codigo: "REP-005", descripcion: "Batería Motorola Moto G24", precio: pesos(34_900), stockInicial: 15, stockMinimo: 3, popularidad: 2 },
      { codigo: "REP-006", descripcion: "Batería iPhone 13", precio: pesos(79_900), stockInicial: 8, stockMinimo: 2, popularidad: 1 },
    ],
  },
];

// ---------------------------------------------------------------------------------------------------------
// Clientes (documentos con formato válido; los CUIT con su dígito verificador)
// ---------------------------------------------------------------------------------------------------------

type ClienteSemilla = {
  tipoDoc: TipoDoc;
  nroDoc: string;
  nombre: string;
  domicilio: string;
  telefono: string;
  email: string;
  cuentaCorriente: boolean;
  limiteCredito: number | null; // centavos; null = sin límite
};

const CLIENTES: ClienteSemilla[] = [
  { tipoDoc: "DNI", nroDoc: "30.512.874", nombre: "Martín Alejandro Gómez", domicilio: "Av. Mate de Luna 2150, San Miguel de Tucumán", telefono: "(381) 455-1203", email: "martin.gomez@correo.test", cuentaCorriente: true, limiteCredito: pesos(800_000) },
  { tipoDoc: "DNI", nroDoc: "35.218.640", nombre: "Lucía Fernández", domicilio: "Crisóstomo Álvarez 845, San Miguel de Tucumán", telefono: "(381) 432-7781", email: "lucia.fernandez@correo.test", cuentaCorriente: true, limiteCredito: null },
  { tipoDoc: "CUIT", nroDoc: "30-71589324-6", nombre: "Servicio Técnico Norte SRL", domicilio: "Av. Sarmiento 1020, San Miguel de Tucumán", telefono: "(381) 421-9050", email: "compras@stnorte.correo.test", cuentaCorriente: true, limiteCredito: null },
  { tipoDoc: "CUIT", nroDoc: "20-25874123-5", nombre: "Jorge Daniel Paz", domicilio: "Av. Aconquija 1450, Yerba Buena", telefono: "(381) 425-6612", email: "jorge.paz@correo.test", cuentaCorriente: true, limiteCredito: pesos(1_500_000) },
  { tipoDoc: "DNI", nroDoc: "38.745.112", nombre: "Carolina Soria", domicilio: "San Martín 512, Banda del Río Salí", telefono: "(381) 459-3320", email: "carolina.soria@correo.test", cuentaCorriente: true, limiteCredito: pesos(600_000) },
  { tipoDoc: "DNI", nroDoc: "41.203.558", nombre: "Ramiro Ledesma", domicilio: "Av. Alem 330, Tafí Viejo", telefono: "(381) 461-2087", email: "ramiro.ledesma@correo.test", cuentaCorriente: false, limiteCredito: null },
  { tipoDoc: "DNI", nroDoc: "33.987.401", nombre: "Valeria Juárez", domicilio: "España 245, Concepción", telefono: "(3865) 42-1198", email: "valeria.juarez@correo.test", cuentaCorriente: false, limiteCredito: null },
  { tipoDoc: "CUIT", nroDoc: "20-28456981-5", nombre: "Tomás Medina", domicilio: "Av. Belgrano 2780, San Miguel de Tucumán", telefono: "(381) 440-5567", email: "tomas.medina@correo.test", cuentaCorriente: false, limiteCredito: null },
  { tipoDoc: "DNI", nroDoc: "44.612.309", nombre: "Ana Belén Costilla", domicilio: "Laprida 1190, San Miguel de Tucumán", telefono: "(381) 450-8834", email: "ana.costilla@correo.test", cuentaCorriente: false, limiteCredito: null },
  { tipoDoc: "DNI", nroDoc: "29.874.556", nombre: "Diego Albarracín", domicilio: "Rivadavia 89, Famaillá", telefono: "(3863) 46-1022", email: "diego.albarracin@correo.test", cuentaCorriente: false, limiteCredito: null },
];

const MARCAS_TARJETA = ["Visa", "Mastercard", "Cabal", "Naranja", "American Express"] as const;

// ---------------------------------------------------------------------------------------------------------
// Pasos del script
// ---------------------------------------------------------------------------------------------------------

async function crearUsuarioSiNoExiste(datos: { nombre: string; email: string; rol: "admin" | "vendedor"; password: string }) {
  try {
    const usuario = await crearUsuario(SISTEMA, datos);
    console.log(`  + ${usuario.rol.padEnd(8)} ${usuario.email}`);
  } catch (error) {
    if (error instanceof ApiError && error.code === "EMAIL_DUPLICADO") {
      console.log(`  = ${datos.rol.padEnd(8)} ${datos.email} (ya existía)`);
      return;
    }
    throw error;
  }
}

type ProductoCargado = ProductoSemilla & { id: number; existencia: number };
type ClienteCargado = ClienteSemilla & { id: number; saldo: number };

type FacturaPlan = {
  momento: number;
  vendedor: UsuarioSesion;
  cliente: ClienteCargado | null;
  items: { producto: ProductoCargado; cantidad: number }[];
  forma: FormaPago;
  anular?: { momento: number; motivo: string };
};

// Arma las 50 facturas en memoria (sin tocar la base) respetando el stock y los límites de crédito,
// así ningún servicio las rechaza. Los pagos y anulaciones solo bajan saldos: el plan queda del lado seguro.
function planificarFacturas(
  ahora: number,
  productos: ProductoCargado[],
  clientes: ClienteCargado[],
  vendedores: UsuarioSesion[],
): FacturaPlan[] {
  const CANTIDAD = 50;

  // Fechas: 3 ventas hoy y el resto entre 1 y 29 días atrás, con algo más de movimiento en los días recientes
  // (la probabilidad crece en línea recta hasta el doble). De 9 a 20 hs de Argentina, nunca en el futuro.
  const momentos: number[] = [];
  for (let i = 0; i < CANTIDAD; i++) {
    const reciente = Math.sqrt(1 + 3 * azar.numero()) - 1; // 0 = hace 29 días, 1 = ayer
    const diasAtras = i < 3 ? 0 : 29 - Math.min(28, Math.floor(reciente * 29));
    let momento = inicioDelDia(ahora, diasAtras) + 9 * HORA + azar.entero(0, 11 * 60 - 1) * MINUTO;
    if (momento > ahora - 5 * MINUTO) momento = ahora - azar.entero(5, 180) * MINUTO;
    momentos.push(momento);
  }
  momentos.sort((a, b) => a - b);
  for (let i = 1; i < momentos.length; i++) {
    if (momentos[i] <= momentos[i - 1]) momentos[i] = momentos[i - 1] + MINUTO;
  }

  const stock = new Map(productos.map((p) => [p.id, p.existencia]));
  const saldo = new Map(clientes.map((c) => [c.id, 0]));

  // Productos que tienen que quedar bajo el mínimo: se venden en facturas fijas, repartidas en el mes.
  const forzados = new Map<number, { producto: ProductoCargado; cantidad: number }[]>();
  const indicesForzados = [6, 14, 22, 29, 35, 41, 46, 48];
  let posicion = 0;
  for (const producto of productos.filter((p) => p.reponer)) {
    for (let restante = producto.reponer!; restante > 0; ) {
      const cantidad = Math.min(restante, producto.precio > pesos(100_000) ? 1 : 2);
      const indice = indicesForzados[posicion++ % indicesForzados.length];
      forzados.set(indice, [...(forzados.get(indice) ?? []), { producto, cantidad }]);
      restante -= cantidad;
    }
  }

  // Elección al azar ponderada por popularidad, sin dejar a ningún producto común bajo su mínimo.
  const elegibles = productos.filter((p) => !p.reponer && p.popularidad > 0);
  const elegirProducto = (excluir: Set<number>, filtro: (p: ProductoCargado) => boolean) => {
    const candidatos = elegibles.filter((p) => !excluir.has(p.id) && filtro(p) && stock.get(p.id)! - 1 >= p.stockMinimo);
    const total = candidatos.reduce((suma, p) => suma + p.popularidad, 0);
    let punto = azar.numero() * total;
    for (const p of candidatos) {
      punto -= p.popularidad;
      if (punto < 0) return p;
    }
    return candidatos.at(-1) ?? null;
  };
  const esCelular = (p: ProductoCargado) => p.codigo.startsWith("CEL-");
  const esRepuesto = (p: ProductoCargado) => p.codigo.startsWith("REP-");

  const plan: FacturaPlan[] = [];
  for (let i = 0; i < CANTIDAD; i++) {
    const cliente = azar.numero() < 0.4 ? null : azar.elegir(clientes);
    const items = new Map<number, { producto: ProductoCargado; cantidad: number }>();
    for (const forzado of forzados.get(i) ?? []) items.set(forzado.producto.id, { ...forzado });

    // Un celular en un cuarto de las ventas; el servicio técnico compra repuestos; el resto, accesorios.
    const tipo = cliente?.nombre.startsWith("Servicio Técnico") ? "repuestos" : azar.numero() < 0.25 ? "celular" : "accesorios";
    const renglones = tipo === "accesorios" ? azar.entero(1, 3) : azar.entero(1, 2);
    for (let r = 0; r < renglones; r++) {
      const filtro =
        tipo === "celular" && r === 0 ? esCelular : tipo === "repuestos" ? esRepuesto : (p: ProductoCargado) => !esCelular(p) && !esRepuesto(p);
      const producto = elegirProducto(new Set(items.keys()), filtro);
      if (!producto) continue;
      const maximo = Math.min(esCelular(producto) || esRepuesto(producto) ? 1 : 3, stock.get(producto.id)! - producto.stockMinimo);
      items.set(producto.id, { producto, cantidad: azar.entero(1, Math.max(1, maximo)) });
    }
    if (items.size === 0) {
      const producto = elegirProducto(new Set(), () => true)!;
      items.set(producto.id, { producto, cantidad: 1 });
    }

    const total = [...items.values()].reduce((suma, item) => suma + item.cantidad * item.producto.precio, 0);

    // Forma de pago: a cuenta solo si el cliente la tiene y no se pasa del límite (regla 7).
    let forma: FormaPago = azar.numero() < 0.55 ? "contado" : "tarjeta";
    if (cliente?.cuentaCorriente && azar.numero() < 0.65) {
      const nuevoSaldo = saldo.get(cliente.id)! + total;
      if (cliente.limiteCredito === null || nuevoSaldo <= cliente.limiteCredito) {
        forma = "cuenta_corriente";
        saldo.set(cliente.id, nuevoSaldo);
      }
    }

    for (const item of items.values()) stock.set(item.producto.id, stock.get(item.producto.id)! - item.cantidad);
    plan.push({ momento: momentos[i], vendedor: vendedores[i % 3 === 0 ? 0 : 1], cliente, items: [...items.values()], forma });
  }

  // Dos anulaciones (RF-V9), hechas por el administrador poco después de emitir: una de contado y una a cuenta.
  // Se eligen facturas sin productos "a reponer", así esos productos siguen bajo el mínimo.
  const sinForzados = (indice: number) => !forzados.has(indice);
  const aAnular = [
    { indice: plan.findIndex((f, i) => i >= 12 && f.forma === "contado" && sinForzados(i)), motivo: "Error en la carga: se facturó un producto equivocado." },
    { indice: plan.findIndex((f, i) => i >= 25 && f.forma === "cuenta_corriente" && sinForzados(i)), motivo: "El cliente desistió de la compra antes de retirar." },
  ];
  for (const { indice, motivo } of aAnular) {
    if (indice < 0) continue;
    const factura = plan[indice];
    factura.anular = { momento: Math.min(factura.momento + azar.entero(20, 90) * MINUTO, ahora - MINUTO), motivo };
  }
  return plan;
}

async function main() {
  const ahora = DateReal.now();

  // 1. Usuarios (RF-U3), desde .env.
  console.log("Usuarios:");
  const admin = { email: leerVariable("SEED_ADMIN_EMAIL"), password: leerVariable("SEED_ADMIN_PASSWORD") };
  const vendedor = { email: leerVariable("SEED_VENDEDOR_EMAIL"), password: leerVariable("SEED_VENDEDOR_PASSWORD") };
  await crearUsuarioSiNoExiste({ nombre: leerVariable("SEED_ADMIN_NOMBRE"), rol: "admin", ...admin });
  await crearUsuarioSiNoExiste({ nombre: leerVariable("SEED_VENDEDOR_NOMBRE"), rol: "vendedor", ...vendedor });

  // De acá en adelante se trabaja con los usuarios reales: facturas, pagos y movimientos guardan quién los hizo.
  const usuarioAdmin = await iniciarSesion(admin);
  const usuarioVendedor = await iniciarSesion(vendedor);

  const remota = !(process.env.DATABASE_URL ?? "file:").startsWith("file:");
  if (remota && !process.argv.includes("--remoto")) {
    console.log("\nLa base no es un archivo local: no se cargan los datos de prueba.");
    console.log("Si de verdad querés cargarlos en la base remota: pnpm run db:seed -- --remoto");
    return;
  }

  // No duplicar: los datos de prueba se cargan sobre una base recién migrada.
  if ((await listarCategorias(usuarioAdmin, { activa: "todos" })).length > 0) {
    console.log("\nLa base ya tiene categorías cargadas: no se vuelven a crear los datos de prueba.");
    console.log("Para empezar de cero, borrá local.db y corré pnpm run db:migrate y pnpm run db:seed.");
    return;
  }

  // 2. Categorías y productos (RF-P2, RF-P7). El stock inicial queda como ingreso "Stock inicial".
  // Se cargan 31 días atrás, antes de la primera venta.
  console.log("\nCatálogo:");
  const momentoCatalogo = inicioDelDia(ahora, 31) + 9 * HORA;
  const productos: ProductoCargado[] = [];
  for (const { categoria, productos: lista } of CATALOGO) {
    const creada = await conFecha(momentoCatalogo, () => crearCategoria(usuarioAdmin, { nombre: categoria }));
    for (const semilla of lista) {
      const producto = await conFecha(momentoCatalogo, () =>
        crearProducto(usuarioAdmin, {
          codigo: semilla.codigo,
          descripcion: semilla.descripcion,
          categoriaId: creada.id,
          precio: semilla.precio,
          stockMinimo: semilla.stockMinimo,
          stockInicial: semilla.stockInicial,
        }),
      );
      productos.push({ ...semilla, id: producto.id, existencia: producto.existencia });
    }
    console.log(`  + ${categoria} (${lista.length} productos)`);
  }

  // 3. Clientes (RF-C2).
  const clientes: ClienteCargado[] = [];
  for (const semilla of CLIENTES) {
    const cliente = await conFecha(momentoCatalogo, () => crearCliente(usuarioVendedor, semilla));
    clientes.push({ ...semilla, id: cliente.id, saldo: 0 });
  }
  console.log(`\nClientes: ${clientes.length} (${clientes.filter((c) => c.cuentaCorriente).length} con cuenta corriente)`);

  // 4. Facturas, anulaciones y pagos, en orden cronológico: así la numeración sigue a las fechas (regla 4).
  const plan = planificarFacturas(ahora, productos, clientes, [usuarioAdmin, usuarioVendedor]);

  type Evento = { momento: number; ejecutar: () => Promise<void> };
  const eventos: Evento[] = [];
  const idsFactura = new Map<FacturaPlan, number>();

  for (const factura of plan) {
    eventos.push({
      momento: factura.momento,
      ejecutar: async () => {
        const total = factura.items.reduce((suma, item) => suma + item.cantidad * item.producto.precio, 0);
        const pago =
          factura.forma === "tarjeta"
            ? { forma: "tarjeta" as const, tarjeta: { tipo: azar.elegir(["debito", "credito"] as const), marca: azar.elegir(MARCAS_TARJETA), ultimos4: String(azar.entero(0, 9999)).padStart(4, "0") } }
            : factura.forma === "cuenta_corriente"
              ? { forma: "cuenta_corriente" as const }
              : { forma: "contado" as const, montoRecibido: azar.numero() < 0.5 ? total : Math.ceil(total / pesos(5_000)) * pesos(5_000) };
        const emitida = await emitirFactura(factura.vendedor, {
          clienteId: factura.cliente?.id ?? null,
          items: factura.items.map((item) => ({ productoId: item.producto.id, cantidad: item.cantidad })),
          pago,
        });
        idsFactura.set(factura, emitida.id);
      },
    });
    if (factura.anular) {
      const { motivo } = factura.anular;
      eventos.push({
        momento: factura.anular.momento,
        ejecutar: async () => {
          await anularFactura(usuarioAdmin, idsFactura.get(factura)!, { motivo });
        },
      });
    }
  }

  // Pagos de cuenta corriente (RF-C5): cuatro, repartidos en la segunda mitad del mes.
  // El importe sale del saldo real del cliente en ese momento (regla 8: nunca supera la deuda).
  const pagosRegistrados: string[] = [];
  const conCuenta = clientes.filter((c) => c.cuentaCorriente);
  const medios: MedioPago[] = ["efectivo", "transferencia", "efectivo", "tarjeta_debito"];
  [18, 28, 37, 45].forEach((indice, orden) => {
    const momento = Math.min(plan[indice].momento + azar.entero(30, 240) * MINUTO, ahora - 2 * MINUTO);
    eventos.push({
      momento,
      ejecutar: async () => {
        for (let intento = 0; intento < conCuenta.length; intento++) {
          const cliente = conCuenta[(orden + intento) % conCuenta.length];
          const { saldo } = await obtenerCliente(usuarioVendedor, cliente.id);
          if (saldo <= 0) continue;
          const importe = Math.min(saldo, Math.max(pesos(10_000), Math.round((saldo * 0.5) / pesos(1_000)) * pesos(1_000)));
          const recibo = await registrarPago(usuarioVendedor, cliente.id, {
            importe,
            medio: medios[orden],
            observacion: importe === saldo ? "Cancela el saldo" : "Pago a cuenta",
          });
          pagosRegistrados.push(`${recibo.numeroRecibo} · ${cliente.nombre} · ${formatearMoneda(importe)}`);
          return;
        }
      },
    });
  });

  eventos.sort((a, b) => a.momento - b.momento);
  for (const evento of eventos) await conFecha(evento.momento, evento.ejecutar);

  // 5. Resumen.
  const tablero = await obtenerTablero(usuarioAdmin);
  const bajoMinimo = await listarProductos(usuarioAdmin, { bajoMinimo: "true", pageSize: "100" });
  const porForma = plan.reduce<Record<string, number>>((cuenta, f) => ({ ...cuenta, [f.forma]: (cuenta[f.forma] ?? 0) + 1 }), {});

  console.log(`\nFacturas: ${plan.length} (contado ${porForma.contado ?? 0}, tarjeta ${porForma.tarjeta ?? 0}, cuenta corriente ${porForma.cuenta_corriente ?? 0})`);
  console.log(`  Anuladas: ${plan.filter((f) => f.anular).length}`);
  console.log(`  Vendido en el mes (emitidas): ${formatearMoneda(tablero.mes.importe)} en ${tablero.mes.cantidad} facturas`);
  console.log(`  Vendido hoy: ${formatearMoneda(tablero.hoy.importe)} en ${tablero.hoy.cantidad} facturas`);
  console.log(`\nPagos de cuenta corriente: ${pagosRegistrados.length}`);
  for (const linea of pagosRegistrados) console.log(`  ${linea}`);
  console.log(`  Deuda total: ${formatearMoneda(tablero.cuentasCorrientes.totalAdeudado)} (${tablero.cuentasCorrientes.clientesConSaldo} clientes)`);
  console.log(`\nProductos para reponer: ${bajoMinimo.total}`);
  for (const p of bajoMinimo.data) console.log(`  ${p.codigo} ${p.descripcion}: ${p.existencia} (mínimo ${p.stockMinimo})`);
  console.log("\nDatos iniciales listos.");
}

main().catch((error) => {
  globalThis.Date = DateReal;
  console.error("No se pudieron cargar los datos iniciales:", error instanceof ApiError ? error.toJSON() : error);
  process.exitCode = 1;
});
