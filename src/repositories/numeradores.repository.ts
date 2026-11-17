// Acceso a datos de la tabla numeradores (regla 4): último número asignado de cada serie.
// Solo consultas Drizzle, sin reglas de negocio. Lo usan facturas y pagos.
import "server-only";
import { eq, sql } from "drizzle-orm";
import { db, type Ejecutor } from "@/db";
import { numeradores } from "@/db/schema";

// Toma el siguiente número de la serie incrementando ultimo_numero. Se llama dentro de la transacción
// que graba el comprobante: dos operaciones simultáneas nunca reciben el mismo número ni dejan huecos,
// y si la transacción falla el incremento también se deshace.
export async function siguienteNumero(clave: string, ejecutor: Ejecutor = db): Promise<number> {
  const [fila] = await ejecutor
    .insert(numeradores)
    .values({ clave, ultimoNumero: 1 })
    .onConflictDoUpdate({ target: numeradores.clave, set: { ultimoNumero: sql`${numeradores.ultimoNumero} + 1` } })
    .returning({ numero: numeradores.ultimoNumero });
  return fila.numero;
}

// Último número usado de la serie (0 si todavía no se usó). Solo para mostrar el próximo.
export async function ultimoNumero(clave: string, ejecutor: Ejecutor = db): Promise<number> {
  const [fila] = await ejecutor
    .select({ ultimo: numeradores.ultimoNumero })
    .from(numeradores)
    .where(eq(numeradores.clave, clave))
    .limit(1);
  return fila?.ultimo ?? 0;
}
