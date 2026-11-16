"use client";

// Campo de importe en pesos (sección 10.6: "campo de importe"). El usuario escribe pesos con coma decimal
// ("12.345,50") y el formulario lo convierte a centavos con textoACentavos() de src/lib/format.ts.
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function CampoImporte({ className, ...props }: Omit<React.ComponentProps<typeof Input>, "type">) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">$</span>
      <Input type="text" inputMode="decimal" autoComplete="off" placeholder="0,00" className={cn("pl-7", className)} {...props} />
    </div>
  );
}
