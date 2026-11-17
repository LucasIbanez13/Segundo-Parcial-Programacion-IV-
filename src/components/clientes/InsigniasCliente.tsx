// Insignias del dominio de clientes.
import { Insignia } from "@/components/comunes/InsigniaEstado";

// Solo se marca a los clientes que tienen la cuenta corriente habilitada.
export function InsigniaCuentaCorriente({ habilitada }: { habilitada: boolean }) {
  return habilitada ? <Insignia tono="principal">Cta. cte.</Insignia> : null;
}
