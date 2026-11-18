// Servicio del tablero de inicio (sección 10.2; RF-T1 a RF-T3). Ambos roles lo ven (sección 3).
// Solo lee: junta en una respuesta todo lo que muestra la pantalla de inicio (sección 11.7).
import "server-only";
import { exigirRol, type UsuarioSesion } from "@/lib/auth/permisos";
import { FORMAS_PAGO, type FormaPago } from "@/lib/constants";
import { inicioDelDiaArgentina } from "@/lib/schemas/comun";
import * as clientesRepo from "@/repositories/clientes.repository";
import * as facturasRepo from "@/repositories/facturas.repository";
import * as productosRepo from "@/repositories/productos.repository";

const UN_DIA_MS = 24 * 60 * 60 * 1000;
// Argentina está en UTC−3 todo el año (sin horario de verano).
const DESFASE_ARGENTINA_MS = 3 * 60 * 60 * 1000;
const DIAS_GRAFICO = 30;
const MAS_VENDIDOS = 5;

export type Tablero = {
  hoy: { cantidad: number; importe: number };
  mes: { cantidad: number; importe: number; ticketPromedio: number };
  cuentasCorrientes: { totalAdeudado: number; clientesConSaldo: number };
  bajoMinimo: { cantidad: number };
  ventasDiarias: { fecha: string; importe: number }[];
  porFormaDePago: { forma: FormaPago; importe: number }[];
  masVendidos: { productoId: number; codigo: string; descripcion: string; unidades: number; importe: number }[];
};

// Día "AAAA-MM-DD" en hora de Argentina de un instante.
function diaArgentina(instante: Date): string {
  return new Date(instante.getTime() - DESFASE_ARGENTINA_MS).toISOString().slice(0, 10);
}

// RF-T1 a RF-T3: indicadores, gráficos y más vendidos. "Hoy", "el mes" y "los últimos 30 días" se calculan en
// hora de Argentina; solo cuentan las facturas emitidas (las anuladas no suman). Importes en centavos (regla 10).
export async function obtenerTablero(actor: UsuarioSesion, ahora = new Date()): Promise<Tablero> {
  exigirRol(actor, "admin", "vendedor");

  const hoy = diaArgentina(ahora);
  const inicioHoy = inicioDelDiaArgentina(hoy);
  const finHoy = new Date(inicioHoy.getTime() + UN_DIA_MS);
  const inicioMes = inicioDelDiaArgentina(`${hoy.slice(0, 7)}-01`);
  const inicio30Dias = new Date(inicioHoy.getTime() - (DIAS_GRAFICO - 1) * UN_DIA_MS);

  const [resumenHoy, resumenMes, deudores, bajoMinimo, porDia, porForma, masVendidos] = await Promise.all([
    facturasRepo.resumenEmitidas(inicioHoy, finHoy),
    facturasRepo.resumenEmitidas(inicioMes, finHoy),
    // Regla 7: saldo = débitos − créditos; solo cuentan los clientes que deben.
    clientesRepo.listar({ conDeuda: true, orden: "saldo", limite: 1, desplazamiento: 0 }),
    // Mismo criterio que GET /api/productos?bajoMinimo=true: activos con existencia < stock mínimo.
    productosRepo.listar({ bajoMinimo: true, activo: true, limite: 1, desplazamiento: 0 }),
    facturasRepo.importePorDia(inicio30Dias, finHoy),
    facturasRepo.importePorForma(inicioMes, finHoy),
    facturasRepo.masVendidos(inicioMes, finHoy, MAS_VENDIDOS),
  ]);

  // RF-T2: siempre 30 días, del más viejo a hoy, con 0 en los días sin ventas (el gráfico no tiene huecos).
  const importeDelDia = new Map(porDia.map((fila) => [fila.fecha, fila.importe]));
  const ventasDiarias = Array.from({ length: DIAS_GRAFICO }, (_, indice) => {
    const fecha = diaArgentina(new Date(inicio30Dias.getTime() + indice * UN_DIA_MS + DESFASE_ARGENTINA_MS));
    return { fecha, importe: importeDelDia.get(fecha) ?? 0 };
  });

  // RF-T2: las tres formas de pago, aunque alguna no tenga ventas en el mes.
  const importeDeForma = new Map(porForma.map((fila) => [fila.forma, fila.importe]));

  return {
    hoy: { cantidad: resumenHoy.cantidad, importe: resumenHoy.importe },
    mes: {
      cantidad: resumenMes.cantidad,
      importe: resumenMes.importe,
      ticketPromedio: resumenMes.cantidad === 0 ? 0 : Math.round(resumenMes.importe / resumenMes.cantidad),
    },
    cuentasCorrientes: { totalAdeudado: deudores.totalSaldos, clientesConSaldo: deudores.total },
    bajoMinimo: { cantidad: bajoMinimo.total },
    ventasDiarias,
    porFormaDePago: FORMAS_PAGO.map((forma) => ({ forma, importe: importeDeForma.get(forma) ?? 0 })),
    masVendidos,
  };
}
