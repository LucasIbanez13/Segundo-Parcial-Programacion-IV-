// Página 404 propia.
import Link from "next/link";
import { Pila, Texto, Titulo } from "@/components/base/primitivas";
import { Button } from "@/components/ui/button";

export default function NoEncontrado() {
  return (
    <Pila espacio={4} className="min-h-svh items-center justify-center px-4 text-center">
      <Texto variante="chico" className="font-mono">
        Error 404
      </Texto>
      <Titulo>No encontramos esta página</Titulo>
      <Texto variante="suave">Puede que el enlace esté mal o que el registro ya no exista.</Texto>
      <Button asChild>
        <Link href="/">Volver al inicio</Link>
      </Button>
    </Pila>
  );
}
